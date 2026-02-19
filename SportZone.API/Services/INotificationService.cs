namespace SportZone.API.Services;

public interface INotificationService
{
    Task EnviarNotificacionGolAsync(Guid partidoId, string equipoNombre, string jugadorNombre, int minuto);
    Task EnviarNotificacionTarjetaAsync(Guid partidoId, string tipoTarjeta, string equipoNombre, string jugadorNombre, int minuto);
    Task EnviarNotificacionInicioPartidoAsync(Guid partidoId, string equipoLocal, string equipoVisita, DateTime fechaHora);
    Task EnviarNotificacionFinPartidoAsync(Guid partidoId, string equipoLocal, string equipoVisita, int golesLocal, int golesVisita);
    Task RegistrarTokenFCMAsync(Guid usuarioId, string token, string plataforma);
    Task EliminarTokenFCMAsync(string token);
}
