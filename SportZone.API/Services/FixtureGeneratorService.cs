using Supabase;
using SportZone.API.Models.DTOs;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class FixtureGeneratorService : IFixtureGeneratorService
{
    private readonly Client _supabase;

    public FixtureGeneratorService(Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<List<PartidoDto>> GenerarFixtureAsync(GenerarFixtureDto dto)
    {
        // Validar horarios disponibles
        if (dto.HorariosDisponibles == null || dto.HorariosDisponibles.Count == 0)
        {
            throw new ArgumentException("Debe proporcionar al menos un horario disponible");
        }

        // Obtener equipos del torneo (a través de la tabla posiciones o partidos)
        var partidosDelTorneoResponse = await _supabase
            .From<Partido>()
            .Where(p => p.TorneoId == dto.TorneoId)
            .Limit(1)
            .Get();

        if (partidosDelTorneoResponse.Models.Count > 0)
        {
            throw new InvalidOperationException("El torneo ya tiene partidos generados. Elimine los partidos existentes antes de generar un nuevo fixture.");
        }

        // Obtener equipos participantes del torneo desde la tabla posiciones
        var posicionesResponse = await _supabase
            .From<Posicion>()
            .Where(p => p.TorneoId == dto.TorneoId)
            .Get();

        if (posicionesResponse.Models.Count < 2)
        {
            throw new InvalidOperationException("Se necesitan al menos 2 equipos registrados en el torneo para generar un fixture");
        }

        // Obtener IDs de equipos únicos
        var equipoIds = posicionesResponse.Models.Select(p => p.EquipoId).Distinct().ToList();

        // Obtener información de los equipos
        var equiposResponse = await _supabase
            .From<Equipo>()
            .Get();

        var equipos = equiposResponse.Models.Where(e => equipoIds.Contains(e.Id)).ToList();

        if (equipos.Count < 2)
        {
            throw new InvalidOperationException("Se necesitan al menos 2 equipos para generar un fixture");
        }

        var n = equipos.Count;
        if (n % 2 != 0)
        {
            // Agregar equipo "fantasma" para número impar
            equipos.Add(new Equipo { Id = Guid.Empty, Nombre = "DESCANSO" });
            n++;
        }

        var partidos = new List<PartidoDto>();
        var random = dto.Seed.HasValue ? new Random(dto.Seed.Value) : new Random();
        var fechaActual = dto.FechaInicio;
        var jornada = 1;

        // Algoritmo Round-Robin
        var totalJornadas = n - 1;
        var partidosPorJornada = n / 2;

        for (int ronda = 0; ronda < (dto.IdaYVuelta ? 2 : 1); ronda++)
        {
            var esVuelta = ronda == 1;

            for (int j = 0; j < totalJornadas; j++)
            {
                for (int p = 0; p < partidosPorJornada; p++)
                {
                    int local, visita;

                    if (p == 0)
                    {
                        local = 0;
                        visita = n - 1 - j;
                    }
                    else
                    {
                        local = (j + p) % (n - 1);
                        if (local == 0) local = n - 1;
                        visita = (j - p + n - 1) % (n - 1);
                        if (visita == 0) visita = n - 1;
                    }

                    // Invertir local/visita en la vuelta
                    if (esVuelta)
                    {
                        (local, visita) = (visita, local);
                    }

                    var equipoLocal = equipos[local];
                    var equipoVisita = equipos[visita];

                    // Saltar si alguno es el equipo fantasma
                    if (equipoLocal.Id == Guid.Empty || equipoVisita.Id == Guid.Empty)
                    {
                        continue;
                    }

                    // Asignar horario aleatorio
                    var horario = dto.HorariosDisponibles[random.Next(dto.HorariosDisponibles.Count)];
                    var fechaHora = fechaActual.Date + horario;

                    // Validar conflictos
                    int intentos = 0;
                    while ((!await ValidarConflictosAsync(equipoLocal.Id, fechaHora) || 
                            !await ValidarConflictosAsync(equipoVisita.Id, fechaHora)) && 
                           intentos < 365)
                    {
                        fechaHora = fechaHora.AddDays(1);
                        intentos++;
                    }

                    if (intentos >= 365)
                    {
                        throw new InvalidOperationException(
                            $"No se pudo encontrar fecha válida para {equipoLocal.Nombre} vs {equipoVisita.Nombre} después de 365 intentos");
                    }

                    // Crear partido
                    var partido = new Partido
                    {
                        Id = Guid.NewGuid(),
                        TorneoId = dto.TorneoId,
                        EquipoLocalId = equipoLocal.Id,
                        EquipoVisitaId = equipoVisita.Id,
                        FechaHora = fechaHora,
                        Jornada = jornada,
                        Estado = "programado",
                        GolesLocal = 0,
                        GolesVisita = 0,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Guardar en base de datos
                    await _supabase.From<Partido>().Insert(partido);

                    partidos.Add(new PartidoDto
                    {
                        Id = partido.Id,
                        Jornada = partido.Jornada,
                        FechaHora = partido.FechaHora,
                        Estado = partido.Estado,
                        GolesLocal = partido.GolesLocal,
                        GolesVisita = partido.GolesVisita,
                        EquipoLocalNombre = equipoLocal.Nombre,
                        EquipoVisitaNombre = equipoVisita.Nombre
                    });
                }

                // Avanzar a la siguiente jornada
                fechaActual = fechaActual.AddDays(dto.DiasMinimosEntrePartidos);
                jornada++;
            }
        }

        return partidos;
    }

    public async Task<bool> ValidarConflictosAsync(Guid equipoId, DateTime fechaHora)
    {
        var fechaInicio = fechaHora.Date;
        var fechaFin = fechaInicio.AddDays(1);

        // Verificar que el equipo no tenga otro partido el mismo día
        var partidosResponse = await _supabase
            .From<Partido>()
            .Where(p => p.EquipoLocalId == equipoId || p.EquipoVisitaId == equipoId)
            .Where(p => p.FechaHora >= fechaInicio && p.FechaHora < fechaFin)
            .Get();

        return partidosResponse.Models.Count == 0;
    }
}
