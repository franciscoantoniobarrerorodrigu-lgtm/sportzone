using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuspensionesController : ControllerBase
{
    private readonly ISuspensionManagerService _suspensionService;

    public SuspensionesController(ISuspensionManagerService suspensionService)
    {
        _suspensionService = suspensionService;
    }

    /// <summary>
    /// Obtiene todas las suspensiones activas de un torneo
    /// </summary>
    [HttpGet("torneo/{torneoId}")]
    public async Task<IActionResult> GetSuspensionesActivas(Guid torneoId)
    {
        try
        {
            var suspensiones = await _suspensionService.GetSuspensionesActivasAsync(torneoId);
            return Ok(new
            {
                success = true,
                data = suspensiones,
                total = suspensiones.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al obtener suspensiones", error = ex.Message });
        }
    }

    /// <summary>
    /// Verifica si un jugador está habilitado para jugar
    /// </summary>
    [HttpGet("validar-habilitacion")]
    public async Task<IActionResult> ValidarHabilitacion([FromQuery] Guid jugadorId, [FromQuery] Guid partidoId)
    {
        try
        {
            var habilitado = await _suspensionService.ValidarJugadorHabilitadoAsync(jugadorId, partidoId);
            return Ok(new
            {
                success = true,
                jugadorId,
                partidoId,
                habilitado,
                message = habilitado ? "Jugador habilitado" : "Jugador suspendido"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al validar habilitación", error = ex.Message });
        }
    }

    /// <summary>
    /// Verifica y crea suspensiones automáticas después de un partido (uso interno)
    /// </summary>
    [HttpPost("verificar/{partidoId}")]
    [Authorize(Policy = "PlanilleroOnly")]
    public async Task<IActionResult> VerificarSuspensiones(Guid partidoId)
    {
        try
        {
            await _suspensionService.VerificarSuspensionesAsync(partidoId);
            return Ok(new
            {
                success = true,
                message = "Suspensiones verificadas y creadas exitosamente"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al verificar suspensiones", error = ex.Message });
        }
    }

    /// <summary>
    /// Descuenta un partido de suspensión (uso interno)
    /// </summary>
    [HttpPost("descontar")]
    [Authorize(Policy = "PlanilleroOnly")]
    public async Task<IActionResult> DescontarSuspension([FromQuery] Guid jugadorId, [FromQuery] Guid partidoId)
    {
        try
        {
            await _suspensionService.DescontarSuspensionAsync(jugadorId, partidoId);
            return Ok(new
            {
                success = true,
                message = "Suspensión descontada exitosamente"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al descontar suspensión", error = ex.Message });
        }
    }
}
