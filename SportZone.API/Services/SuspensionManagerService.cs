using Supabase;
using SportZone.API.Models.DTOs;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class SuspensionManagerService : ISuspensionManagerService
{
    private readonly Client _supabase;

    public SuspensionManagerService(Client supabase)
    {
        _supabase = supabase;
    }

    /// <summary>
    /// Verifica y crea suspensiones automáticas después de un partido
    /// Reglas: 3 amarillas = 1 partido, 1 roja = 2 partidos
    /// </summary>
    public async Task VerificarSuspensionesAsync(Guid partidoId)
    {
        // Obtener el partido
        var partidoResponse = await _supabase
            .From<Partido>()
            .Where(p => p.Id == partidoId)
            .Single();

        if (partidoResponse == null)
        {
            throw new InvalidOperationException("Partido no encontrado");
        }

        var partido = partidoResponse;

        // Obtener todos los eventos del partido (tarjetas)
        var eventosResponse = await _supabase
            .From<EventoPartido>()
            .Where(e => e.PartidoId == partidoId)
            .Where(e => e.Tipo == "tarjeta_amarilla" || e.Tipo == "tarjeta_roja")
            .Get();

        var eventos = eventosResponse.Models;

        // Agrupar por jugador
        var eventosPorJugador = eventos.GroupBy(e => e.JugadorId);

        foreach (var grupo in eventosPorJugador)
        {
            var jugadorId = grupo.Key;
            if (!jugadorId.HasValue) continue;
            
            var eventosJugador = grupo.ToList();

            // Verificar tarjetas rojas
            var tarjetasRojas = eventosJugador.Count(e => e.Tipo == "tarjeta_roja");
            if (tarjetasRojas > 0)
            {
                // Crear suspensión por tarjeta roja (2 partidos)
                await CrearSuspensionAsync(
                    jugadorId.Value,
                    eventosJugador.First().EquipoId,
                    "Tarjeta roja directa",
                    2,
                    partido.FechaHora
                );
                continue;
            }

            // Verificar acumulación de tarjetas amarillas en el torneo
            var totalAmarillasResponse = await _supabase
                .From<EventoPartido>()
                .Where(e => e.JugadorId == jugadorId)
                .Where(e => e.Tipo == "tarjeta_amarilla")
                .Get();

            var totalAmarillas = totalAmarillasResponse.Models.Count;

            // Si tiene 3 o más amarillas, crear suspensión
            if (totalAmarillas >= 3 && totalAmarillas % 3 == 0)
            {
                await CrearSuspensionAsync(
                    jugadorId.Value,
                    eventosJugador.First().EquipoId,
                    $"Acumulación de {totalAmarillas} tarjetas amarillas",
                    1,
                    partido.FechaHora
                );
            }
        }
    }

    /// <summary>
    /// Obtiene todas las suspensiones activas de un torneo
    /// </summary>
    public async Task<List<SuspensionDto>> GetSuspensionesActivasAsync(Guid torneoId)
    {
        var suspensionesResponse = await _supabase
            .From<Suspension>()
            .Where(s => s.Activa == true)
            .Get();

        var suspensiones = suspensionesResponse.Models;
        var resultado = new List<SuspensionDto>();

        foreach (var suspension in suspensiones)
        {
            // Obtener información del jugador
            var jugadorResponse = await _supabase
                .From<Jugador>()
                .Where(j => j.Id == suspension.JugadorId)
                .Single();

            // Obtener información del equipo
            var equipoResponse = await _supabase
                .From<Equipo>()
                .Where(e => e.Id == suspension.EquipoId)
                .Single();

            // Verificar si el equipo participa en el torneo (a través de posiciones)
            var posicionResponse = await _supabase
                .From<Posicion>()
                .Where(p => p.TorneoId == torneoId)
                .Where(p => p.EquipoId == suspension.EquipoId)
                .Get();

            if (posicionResponse.Models.Count == 0)
            {
                continue; // El equipo no participa en este torneo
            }

            resultado.Add(new SuspensionDto
            {
                Id = suspension.Id,
                JugadorId = suspension.JugadorId,
                JugadorNombre = jugadorResponse?.Nombre ?? "Desconocido",
                EquipoId = suspension.EquipoId,
                EquipoNombre = equipoResponse?.Nombre ?? "Desconocido",
                Motivo = suspension.Motivo,
                PartidosSuspendidos = suspension.PartidosSuspendidos,
                PartidosCumplidos = suspension.PartidosCumplidos,
                Activa = suspension.Activa,
                FechaInicio = suspension.FechaInicio,
                FechaFin = suspension.FechaFin
            });
        }

        return resultado;
    }

    /// <summary>
    /// Descuenta un partido de suspensión cuando el equipo juega
    /// </summary>
    public async Task DescontarSuspensionAsync(Guid jugadorId, Guid partidoId)
    {
        // Obtener suspensiones activas del jugador
        var suspensionesResponse = await _supabase
            .From<Suspension>()
            .Where(s => s.JugadorId == jugadorId)
            .Where(s => s.Activa == true)
            .Get();

        var suspensiones = suspensionesResponse.Models;

        foreach (var suspension in suspensiones)
        {
            suspension.PartidosCumplidos++;

            // Si cumplió todos los partidos, desactivar suspensión
            if (suspension.PartidosCumplidos >= suspension.PartidosSuspendidos)
            {
                suspension.Activa = false;
                suspension.FechaFin = DateTime.UtcNow;
            }

            suspension.UpdatedAt = DateTime.UtcNow;

            await _supabase.From<Suspension>().Update(suspension);
        }
    }

    /// <summary>
    /// Valida si un jugador está habilitado para jugar un partido
    /// </summary>
    public async Task<bool> ValidarJugadorHabilitadoAsync(Guid jugadorId, Guid partidoId)
    {
        // Verificar si tiene suspensiones activas
        var suspensionesResponse = await _supabase
            .From<Suspension>()
            .Where(s => s.JugadorId == jugadorId)
            .Where(s => s.Activa == true)
            .Get();

        return suspensionesResponse.Models.Count == 0;
    }

    /// <summary>
    /// Crea una nueva suspensión
    /// </summary>
    private async Task CrearSuspensionAsync(Guid jugadorId, Guid equipoId, string motivo, int partidos, DateTime fechaInicio)
    {
        // Verificar si ya existe una suspensión activa para este jugador
        var suspensionExistenteResponse = await _supabase
            .From<Suspension>()
            .Where(s => s.JugadorId == jugadorId)
            .Where(s => s.Activa == true)
            .Get();

        if (suspensionExistenteResponse.Models.Count > 0)
        {
            // Ya tiene una suspensión activa, no crear otra
            return;
        }

        var suspension = new Suspension
        {
            Id = Guid.NewGuid(),
            JugadorId = jugadorId,
            EquipoId = equipoId,
            Motivo = motivo,
            PartidosSuspendidos = partidos,
            PartidosCumplidos = 0,
            Activa = true,
            FechaInicio = fechaInicio,
            FechaFin = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _supabase.From<Suspension>().Insert(suspension);
    }
}
