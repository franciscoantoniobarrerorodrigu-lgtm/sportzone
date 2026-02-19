namespace SportZone.API.Services;

public interface ISignalRNotificationService
{
    Task NotificarEventoPartidoAsync(Guid partidoId, object evento);
    Task NotificarMinutoActualizadoAsync(Guid partidoId, int minuto);
    Task NotificarMarcadorActualizadoAsync(Guid partidoId, int? golesLocal, int? golesVisita);
    Task NotificarPartidoIniciadoAsync(Guid partidoId);
    Task NotificarPartidoFinalizadoAsync(Guid partidoId);
}
