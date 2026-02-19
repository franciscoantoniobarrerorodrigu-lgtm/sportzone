using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Supabase;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class NotificationService : INotificationService
{
    private readonly Client _supabase;
    private readonly ILogger<NotificationService> _logger;
    private readonly FirebaseMessaging _messaging;

    public NotificationService(
        Client supabase,
        IConfiguration configuration,
        ILogger<NotificationService> logger)
    {
        _supabase = supabase;
        _logger = logger;

        // Inicializar Firebase Admin SDK
        try
        {
            var firebaseCredentials = configuration["Firebase:Credentials"];
            
            if (string.IsNullOrEmpty(firebaseCredentials))
            {
                _logger.LogWarning("Firebase credentials not configured. Notifications will be disabled.");
                _messaging = null!;
                return;
            }

            if (FirebaseApp.DefaultInstance == null)
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromJson(firebaseCredentials)
                });
            }

            _messaging = FirebaseMessaging.DefaultInstance;
            _logger.LogInformation("Firebase Cloud Messaging initialized successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing Firebase Cloud Messaging");
            _messaging = null!;
        }
    }

    public async Task EnviarNotificacionGolAsync(Guid partidoId, string equipoNombre, string jugadorNombre, int minuto)
    {
        if (_messaging == null)
        {
            _logger.LogWarning("Firebase not configured. Skipping notification.");
            return;
        }

        try
        {
            // Obtener tokens FCM de usuarios suscritos
            var tokens = await ObtenerTokensSuscritosAsync(partidoId);

            if (tokens.Count == 0)
            {
                _logger.LogInformation("No hay usuarios suscritos al partido {PartidoId}", partidoId);
                return;
            }

            var message = new MulticastMessage
            {
                Tokens = tokens,
                Notification = new Notification
                {
                    Title = $"⚽ ¡GOL de {equipoNombre}!",
                    Body = $"{jugadorNombre} - Minuto {minuto}'"
                },
                Data = new Dictionary<string, string>
                {
                    { "tipo", "gol" },
                    { "partidoId", partidoId.ToString() },
                    { "equipo", equipoNombre },
                    { "jugador", jugadorNombre },
                    { "minuto", minuto.ToString() }
                },
                Android = new AndroidConfig
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification
                    {
                        Sound = "default",
                        ChannelId = "partidos_en_vivo"
                    }
                },
                Apns = new ApnsConfig
                {
                    Aps = new Aps
                    {
                        Sound = "default",
                        Badge = 1
                    }
                }
            };

            var response = await _messaging.SendEachForMulticastAsync(message);
            _logger.LogInformation("Notificación de gol enviada: {Success} exitosas, {Failure} fallidas", 
                response.SuccessCount, response.FailureCount);

            // Eliminar tokens inválidos
            await EliminarTokensInvalidosAsync(response, tokens);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar notificación de gol");
        }
    }

    public async Task EnviarNotificacionTarjetaAsync(Guid partidoId, string tipoTarjeta, string equipoNombre, string jugadorNombre, int minuto)
    {
        if (_messaging == null)
        {
            _logger.LogWarning("Firebase not configured. Skipping notification.");
            return;
        }

        try
        {
            var tokens = await ObtenerTokensSuscritosAsync(partidoId);

            if (tokens.Count == 0) return;

            var emoji = tipoTarjeta == "tarjeta_roja" ? "🟥" : "🟨";
            var titulo = tipoTarjeta == "tarjeta_roja" ? "Tarjeta Roja" : "Tarjeta Amarilla";

            var message = new MulticastMessage
            {
                Tokens = tokens,
                Notification = new Notification
                {
                    Title = $"{emoji} {titulo}",
                    Body = $"{jugadorNombre} ({equipoNombre}) - Minuto {minuto}'"
                },
                Data = new Dictionary<string, string>
                {
                    { "tipo", tipoTarjeta },
                    { "partidoId", partidoId.ToString() },
                    { "equipo", equipoNombre },
                    { "jugador", jugadorNombre },
                    { "minuto", minuto.ToString() }
                },
                Android = new AndroidConfig
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification
                    {
                        Sound = "default",
                        ChannelId = "partidos_en_vivo"
                    }
                }
            };

            var response = await _messaging.SendEachForMulticastAsync(message);
            _logger.LogInformation("Notificación de tarjeta enviada: {Success} exitosas, {Failure} fallidas", 
                response.SuccessCount, response.FailureCount);

            await EliminarTokensInvalidosAsync(response, tokens);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar notificación de tarjeta");
        }
    }

    public async Task EnviarNotificacionInicioPartidoAsync(Guid partidoId, string equipoLocal, string equipoVisita, DateTime fechaHora)
    {
        if (_messaging == null)
        {
            _logger.LogWarning("Firebase not configured. Skipping notification.");
            return;
        }

        try
        {
            var tokens = await ObtenerTokensSuscritosAsync(partidoId);

            if (tokens.Count == 0) return;

            var message = new MulticastMessage
            {
                Tokens = tokens,
                Notification = new Notification
                {
                    Title = "🏁 ¡Partido iniciado!",
                    Body = $"{equipoLocal} vs {equipoVisita}"
                },
                Data = new Dictionary<string, string>
                {
                    { "tipo", "inicio_partido" },
                    { "partidoId", partidoId.ToString() },
                    { "equipoLocal", equipoLocal },
                    { "equipoVisita", equipoVisita }
                },
                Android = new AndroidConfig
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification
                    {
                        Sound = "default",
                        ChannelId = "partidos_en_vivo"
                    }
                }
            };

            var response = await _messaging.SendEachForMulticastAsync(message);
            _logger.LogInformation("Notificación de inicio enviada: {Success} exitosas, {Failure} fallidas", 
                response.SuccessCount, response.FailureCount);

            await EliminarTokensInvalidosAsync(response, tokens);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar notificación de inicio");
        }
    }

    public async Task EnviarNotificacionFinPartidoAsync(Guid partidoId, string equipoLocal, string equipoVisita, int golesLocal, int golesVisita)
    {
        if (_messaging == null)
        {
            _logger.LogWarning("Firebase not configured. Skipping notification.");
            return;
        }

        try
        {
            var tokens = await ObtenerTokensSuscritosAsync(partidoId);

            if (tokens.Count == 0) return;

            var message = new MulticastMessage
            {
                Tokens = tokens,
                Notification = new Notification
                {
                    Title = "⏱️ ¡Partido finalizado!",
                    Body = $"{equipoLocal} {golesLocal} - {golesVisita} {equipoVisita}"
                },
                Data = new Dictionary<string, string>
                {
                    { "tipo", "fin_partido" },
                    { "partidoId", partidoId.ToString() },
                    { "equipoLocal", equipoLocal },
                    { "equipoVisita", equipoVisita },
                    { "golesLocal", golesLocal.ToString() },
                    { "golesVisita", golesVisita.ToString() }
                },
                Android = new AndroidConfig
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification
                    {
                        Sound = "default",
                        ChannelId = "partidos_en_vivo"
                    }
                }
            };

            var response = await _messaging.SendEachForMulticastAsync(message);
            _logger.LogInformation("Notificación de fin enviada: {Success} exitosas, {Failure} fallidas", 
                response.SuccessCount, response.FailureCount);

            await EliminarTokensInvalidosAsync(response, tokens);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar notificación de fin");
        }
    }

    public async Task RegistrarTokenFCMAsync(Guid usuarioId, string token, string plataforma)
    {
        try
        {
            // Verificar si el token ya existe
            var existenteResponse = await _supabase
                .From<DispositivoFCM>()
                .Where(d => d.Token == token)
                .Get();

            if (existenteResponse.Models.Count > 0)
            {
                // Actualizar usuario_id si cambió
                var dispositivo = existenteResponse.Models.First();
                if (dispositivo.UsuarioId != usuarioId)
                {
                    dispositivo.UsuarioId = usuarioId;
                    dispositivo.UpdatedAt = DateTime.UtcNow;
                    await _supabase.From<DispositivoFCM>().Update(dispositivo);
                }
                return;
            }

            // Crear nuevo registro
            var nuevoDispositivo = new DispositivoFCM
            {
                Id = Guid.NewGuid(),
                UsuarioId = usuarioId,
                Token = token,
                Plataforma = plataforma,
                Activo = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _supabase.From<DispositivoFCM>().Insert(nuevoDispositivo);
            _logger.LogInformation("Token FCM registrado para usuario {UsuarioId}", usuarioId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar token FCM");
            throw;
        }
    }

    public async Task EliminarTokenFCMAsync(string token)
    {
        try
        {
            var dispositivoResponse = await _supabase
                .From<DispositivoFCM>()
                .Where(d => d.Token == token)
                .Get();

            if (dispositivoResponse.Models.Count > 0)
            {
                var dispositivo = dispositivoResponse.Models.First();
                await _supabase.From<DispositivoFCM>().Delete(dispositivo);
                _logger.LogInformation("Token FCM eliminado: {Token}", token);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar token FCM");
            throw;
        }
    }

    private async Task<List<string>> ObtenerTokensSuscritosAsync(Guid partidoId)
    {
        try
        {
            // Obtener suscripciones activas para este partido
            var suscripcionesResponse = await _supabase
                .From<SuscripcionNotificacion>()
                .Where(s => s.PartidoId == partidoId)
                .Where(s => s.Activa == true)
                .Get();

            if (suscripcionesResponse.Models.Count == 0)
            {
                return new List<string>();
            }

            var usuarioIds = suscripcionesResponse.Models.Select(s => s.UsuarioId).Distinct().ToList();

            // Obtener tokens FCM de esos usuarios
            var dispositivosResponse = await _supabase
                .From<DispositivoFCM>()
                .Where(d => d.Activo == true)
                .Get();

            var tokens = dispositivosResponse.Models
                .Where(d => usuarioIds.Contains(d.UsuarioId))
                .Select(d => d.Token)
                .ToList();

            return tokens;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tokens suscritos");
            return new List<string>();
        }
    }

    private async Task EliminarTokensInvalidosAsync(BatchResponse response, List<string> tokens)
    {
        try
        {
            for (int i = 0; i < response.Responses.Count; i++)
            {
                var sendResponse = response.Responses[i];
                if (!sendResponse.IsSuccess && 
                    (sendResponse.Exception?.MessagingErrorCode == MessagingErrorCode.InvalidArgument ||
                     sendResponse.Exception?.MessagingErrorCode == MessagingErrorCode.Unregistered))
                {
                    var tokenInvalido = tokens[i];
                    await EliminarTokenFCMAsync(tokenInvalido);
                    _logger.LogInformation("Token FCM inválido eliminado: {Token}", tokenInvalido);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar tokens inválidos");
        }
    }
}
