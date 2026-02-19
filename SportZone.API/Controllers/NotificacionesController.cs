using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificacionesController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificacionesController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// Registra un token FCM para recibir notificaciones push
    /// </summary>
    [HttpPost("registrar-token")]
    [Authorize]
    public async Task<IActionResult> RegistrarToken([FromBody] RegistrarTokenRequest request)
    {
        try
        {
            // Obtener usuario_id del token JWT
            var usuarioIdClaim = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(usuarioIdClaim) || !Guid.TryParse(usuarioIdClaim, out var usuarioId))
            {
                return Unauthorized(new { success = false, message = "Usuario no autenticado" });
            }

            await _notificationService.RegistrarTokenFCMAsync(usuarioId, request.Token, request.Plataforma);

            return Ok(new
            {
                success = true,
                message = "Token FCM registrado exitosamente"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al registrar token", error = ex.Message });
        }
    }

    /// <summary>
    /// Elimina un token FCM (cuando el usuario cierra sesión o desinstala la app)
    /// </summary>
    [HttpDelete("eliminar-token")]
    [Authorize]
    public async Task<IActionResult> EliminarToken([FromBody] EliminarTokenRequest request)
    {
        try
        {
            await _notificationService.EliminarTokenFCMAsync(request.Token);

            return Ok(new
            {
                success = true,
                message = "Token FCM eliminado exitosamente"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al eliminar token", error = ex.Message });
        }
    }

    /// <summary>
    /// Envía una notificación de prueba (solo para testing)
    /// </summary>
    [HttpPost("test")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> EnviarNotificacionPrueba([FromBody] NotificacionPruebaRequest request)
    {
        try
        {
            await _notificationService.EnviarNotificacionGolAsync(
                request.PartidoId,
                "Equipo Test",
                "Jugador Test",
                45
            );

            return Ok(new
            {
                success = true,
                message = "Notificación de prueba enviada"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al enviar notificación", error = ex.Message });
        }
    }
}

public record RegistrarTokenRequest(string Token, string Plataforma);
public record EliminarTokenRequest(string Token);
public record NotificacionPruebaRequest(Guid PartidoId);
