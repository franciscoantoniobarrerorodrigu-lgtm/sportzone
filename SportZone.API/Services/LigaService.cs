using Supabase;
using SportZone.API.Models.DTOs;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class LigaService : ILigaService
{
    private readonly Client _supabase;
    private readonly ILogger<LigaService> _logger;

    public LigaService(Client supabase, ILogger<LigaService> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    public async Task<IEnumerable<TorneoDto>> GetTorneosActivosAsync()
    {
        try
        {
            // Consultar torneos activos con su temporada
            var response = await _supabase
                .From<Torneo>()
                .Where(t => t.Activo == true)
                .Order(t => t.CreatedAt, Postgrest.Constants.Ordering.Descending)
                .Get();

            if (response?.Models == null || !response.Models.Any())
            {
                return Enumerable.Empty<TorneoDto>();
            }

            // Obtener IDs de temporadas únicas
            var temporadaIds = response.Models.Select(t => t.TemporadaId).Distinct().ToList();

            // Consultar temporadas
            var temporadasResponse = await _supabase
                .From<Temporada>()
                .Filter("id", Postgrest.Constants.Operator.In, temporadaIds)
                .Get();

            var temporadas = temporadasResponse?.Models?.ToDictionary(t => t.Id, t => t.Nombre) 
                ?? new Dictionary<Guid, string>();

            // Mapear a DTOs
            var torneos = response.Models.Select(t => new TorneoDto
            {
                Id = t.Id,
                Nombre = t.Nombre,
                Tipo = t.Tipo,
                TotalJornadas = t.TotalJornadas,
                Activo = t.Activo,
                TemporadaNombre = temporadas.GetValueOrDefault(t.TemporadaId, "N/A")
            });

            return torneos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener torneos activos");
            throw;
        }
    }

    public async Task<IEnumerable<PosicionEquipoDto>> GetTablaPosicionesAsync(Guid torneoId)
    {
        try
        {
            // Consultar posiciones del torneo
            var posicionesResponse = await _supabase
                .From<Posicion>()
                .Where(p => p.TorneoId == torneoId)
                .Get();

            if (posicionesResponse?.Models == null || !posicionesResponse.Models.Any())
            {
                return Enumerable.Empty<PosicionEquipoDto>();
            }

            // Obtener IDs de equipos
            var equipoIds = posicionesResponse.Models.Select(p => p.EquipoId).ToList();

            // Consultar equipos
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, equipoIds)
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e) 
                ?? new Dictionary<Guid, Equipo>();

            // Ordenar por puntos, diferencia y goles a favor
            var posicionesOrdenadas = posicionesResponse.Models
                .OrderByDescending(p => p.Puntos)
                .ThenByDescending(p => p.Diferencia)
                .ThenByDescending(p => p.GolesFavor)
                .ToList();

            // Mapear a DTOs con posición
            var resultado = posicionesOrdenadas.Select((p, index) =>
            {
                var equipo = equipos.GetValueOrDefault(p.EquipoId);
                return new PosicionEquipoDto
                {
                    Posicion = index + 1,
                    Id = p.Id,
                    EquipoNombre = equipo?.Nombre ?? "N/A",
                    Abreviatura = equipo?.Abreviatura ?? "N/A",
                    EscudoUrl = equipo?.EscudoUrl,
                    PartidosJugados = p.PartidosJugados,
                    PartidosGanados = p.PartidosGanados,
                    PartidosEmpatados = p.PartidosEmpatados,
                    PartidosPerdidos = p.PartidosPerdidos,
                    GolesFavor = p.GolesFavor,
                    GolesContra = p.GolesContra,
                    Puntos = p.Puntos,
                    Diferencia = p.Diferencia
                };
            });

            return resultado;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tabla de posiciones para torneo {TorneoId}", torneoId);
            throw;
        }
    }

    public async Task<IEnumerable<PartidoDto>> GetResultadosJornadaAsync(Guid torneoId, int numeroJornada)
    {
        try
        {
            // Consultar partidos de la jornada
            var partidosResponse = await _supabase
                .From<Partido>()
                .Where(p => p.TorneoId == torneoId && p.Jornada == numeroJornada)
                .Order(p => p.FechaHora, Postgrest.Constants.Ordering.Ascending)
                .Get();

            if (partidosResponse?.Models == null || !partidosResponse.Models.Any())
            {
                return Enumerable.Empty<PartidoDto>();
            }

            // Obtener IDs de equipos únicos
            var equipoIds = partidosResponse.Models
                .SelectMany(p => new[] { p.EquipoLocalId, p.EquipoVisitaId })
                .Distinct()
                .ToList();

            // Consultar equipos
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, equipoIds)
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e) 
                ?? new Dictionary<Guid, Equipo>();

            // Mapear a DTOs
            var partidos = partidosResponse.Models.Select(p =>
            {
                var equipoLocal = equipos.GetValueOrDefault(p.EquipoLocalId);
                var equipoVisita = equipos.GetValueOrDefault(p.EquipoVisitaId);

                return new PartidoDto
                {
                    Id = p.Id,
                    Jornada = p.Jornada,
                    FechaHora = p.FechaHora,
                    Estadio = p.Estadio,
                    Estado = p.Estado,
                    GolesLocal = p.GolesLocal,
                    GolesVisita = p.GolesVisita,
                    EquipoLocalNombre = equipoLocal?.Nombre ?? "N/A",
                    EquipoLocalEscudo = equipoLocal?.EscudoUrl,
                    EquipoVisitaNombre = equipoVisita?.Nombre ?? "N/A",
                    EquipoVisitaEscudo = equipoVisita?.EscudoUrl
                };
            });

            return partidos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener resultados de jornada {Jornada} para torneo {TorneoId}", numeroJornada, torneoId);
            throw;
        }
    }
}
