using Microsoft.AspNetCore.SignalR;
using SportZone.API.Hubs;

namespace SportZone.API.Services;

public class SignalRNotificationService : ISignalRNotificationService
{
    private readonly IHubContext<PartidoHub> _hubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<PartidoHub> hubContext, 
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotificarEventoPartidoAsync(Guid partidoId, object evento)
    {
        try
        {
            await _hubContext.Clients
                .Group($"partido_{partidoId}")
                .SendAsync("NuevoEvento", evento);

            await _hubContext.Clients
                .Group("partidos_en_vivo")
                .SendAsync("EventoEnVivo", new { partidoId, evento });

            _logger.LogInformation("Evento notificado para partido {PartidoId}", partidoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al notificar evento del partido {PartidoId}", partidoId);
        }
    }

    public async Task NotificarMinutoActualizadoAsync(Guid partidoId, int minuto)
    {
        try
        {
            await _hubContext.Clients
                .Group($"partido_{partidoId}")
                .SendAsync("MinutoActualizado", minuto);

            _logger.LogDebug("Minuto {Minuto} notificado para partido {PartidoId}", minuto, partidoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al notificar minuto del partido {PartidoId}", partidoId);
        }
    }

    public async Task NotificarMarcadorActualizadoAsync(Guid partidoId, int? golesLocal, int? golesVisita)
    {
        try
        {
            var marcador = new
            {
                partidoId,
                golesLocal = golesLocal ?? 0,
                golesVisita = golesVisita ?? 0
            };

            await _hubContext.Clients
                .Group($"partido_{partidoId}")
                .SendAsync("MarcadorActualizado", marcador);

            await _hubContext.Clients
                .Group("partidos_en_vivo")
                .SendAsync("MarcadorEnVivo", marcador);

            _logger.LogInformation("Marcador actualizado para partido {PartidoId}: {GolesLocal}-{GolesVisita}", 
                partidoId, golesLocal, golesVisita);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al notificar marcador del partido {PartidoId}", partidoId);
        }
    }

    public async Task NotificarPartidoIniciadoAsync(Guid partidoId)
    {
        try
        {
            await _hubContext.Clients
                .Group($"partido_{partidoId}")
                .SendAsync("PartidoIniciado", partidoId);

            await _hubContext.Clients
                .Group("partidos_en_vivo")
                .SendAsync("NuevoPartidoEnVivo", partidoId);

            _logger.LogInformation("Partido {PartidoId} iniciado - notificación enviada", partidoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al notificar inicio del partido {PartidoId}", partidoId);
        }
    }

    public async Task NotificarPartidoFinalizadoAsync(Guid partidoId)
    {
        try
        {
            await _hubContext.Clients
                .Group($"partido_{partidoId}")
                .SendAsync("PartidoFinalizado", partidoId);

            await _hubContext.Clients
                .Group("partidos_en_vivo")
                .SendAsync("PartidoFinalizadoEnVivo", partidoId);

            _logger.LogInformation("Partido {PartidoId} finalizado - notificación enviada", partidoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al notificar finalización del partido {PartidoId}", partidoId);
        }
    }
}
