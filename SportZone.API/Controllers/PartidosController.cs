using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Models.DTOs;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartidosController : ControllerBase
{
    private readonly IPartidosService _partidosService;
    private readonly ILogger<PartidosController> _logger;

    public PartidosController(IPartidosService partidosService, ILogger<PartidosController> logger)
    {
        _partidosService = partidosService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los partidos en vivo
    /// </summary>
    [HttpGet("en-vivo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPartidosEnVivo()
    {
        try
        {
            var partidos = await _partidosService.GetPartidosEnVivoAsync();
            return Ok(partidos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener partidos en vivo");
            return StatusCode(500, new { message = "Error al obtener partidos en vivo" });
        }
    }

    /// <summary>
    /// Obtiene el detalle de un partido específico
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPartido(Guid id)
    {
        try
        {
            var partido = await _partidosService.GetPartidoDetalleAsync(id);
            if (partido == null)
            {
                return NotFound(new { message = "Partido no encontrado" });
            }
            return Ok(partido);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al obtener partido" });
        }
    }

    /// <summary>
    /// Inicia un partido (solo planilleros)
    /// </summary>
    [HttpPost("{id}/iniciar")]
    [Authorize(Policy = "PlanilleroOnly")]
    public async Task<IActionResult> IniciarPartido(Guid id)
    {
        try
        {
            // TODO: Obtener planilleroId del token JWT
            var planilleroId = Guid.NewGuid(); // Placeholder
            await _partidosService.IniciarPartidoAsync(id, planilleroId);
            return Ok(new { message = "Partido iniciado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al iniciar partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al iniciar partido" });
        }
    }

    /// <summary>
    /// Registra un evento en el partido (gol, tarjeta, etc.)
    /// </summary>
    [HttpPost("{id}/eventos")]
    [Authorize(Policy = "PlanilleroOnly")]
    public async Task<IActionResult> RegistrarEvento(Guid id, [FromBody] CreateEventoDto evento)
    {
        try
        {
            await _partidosService.RegistrarEventoAsync(id, evento);
            return Ok(new { message = "Evento registrado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar evento en partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al registrar evento" });
        }
    }

    /// <summary>
    /// Actualiza el minuto actual del partido
    /// </summary>
    [HttpPut("{id}/minuto")]
    [Authorize(Policy = "PlanilleroOnly")]
    public async Task<IActionResult> ActualizarMinuto(Guid id, [FromBody] int minuto)
    {
        try
        {
            await _partidosService.ActualizarMinutoAsync(id, minuto);
            return Ok(new { message = "Minuto actualizado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar minuto del partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al actualizar minuto" });
        }
    }

    /// <summary>
    /// Finaliza un partido
    /// </summary>
    [HttpPost("{id}/finalizar")]
    [Authorize(Policy = "PlanilleroOnly")]
    public async Task<IActionResult> FinalizarPartido(Guid id)
    {
        try
        {
            await _partidosService.FinalizarPartidoAsync(id);
            return Ok(new { message = "Partido finalizado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al finalizar partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al finalizar partido" });
        }
    }

    // ==================== ADMIN CRUD ENDPOINTS ====================

    /// <summary>
    /// Crea un nuevo partido (solo administradores)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreatePartido([FromBody] CreatePartidoDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Error de validación", errors = ModelState });
            }

            var partido = await _partidosService.CreatePartidoAsync(dto);
            return CreatedAtAction(nameof(GetPartido), new { id = partido.Id }, partido);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error de validación al crear partido");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear partido");
            return StatusCode(500, new { message = "Error al guardar el partido. Intente nuevamente." });
        }
    }

    /// <summary>
    /// Obtiene todos los partidos con filtros y paginación (solo administradores)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllPartidos(
        [FromQuery] Guid? torneoId,
        [FromQuery] string? estado,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await _partidosService.GetAllPartidosAsync(torneoId, estado, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener partidos");
            return StatusCode(500, new { message = "Error al obtener partidos. Intente nuevamente." });
        }
    }

    /// <summary>
    /// Obtiene un partido por ID para administración (solo administradores)
    /// </summary>
    [HttpGet("admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetPartidoAdmin(Guid id)
    {
        try
        {
            var partido = await _partidosService.GetPartidoByIdAsync(id);
            if (partido == null)
            {
                return NotFound(new { message = "Partido no encontrado" });
            }
            return Ok(partido);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al obtener partido. Intente nuevamente." });
        }
    }

    /// <summary>
    /// Actualiza un partido existente (solo administradores)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdatePartido(Guid id, [FromBody] UpdatePartidoDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Error de validación", errors = ModelState });
            }

            var partido = await _partidosService.UpdatePartidoAsync(id, dto);
            return Ok(partido);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Partido no encontrado: {PartidoId}", id);
            return NotFound(new { message = "Partido no encontrado" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Error de validación al actualizar partido {PartidoId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al actualizar el partido. Intente nuevamente." });
        }
    }

    /// <summary>
    /// Elimina un partido (solo administradores)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeletePartido(Guid id)
    {
        try
        {
            await _partidosService.DeletePartidoAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Partido no encontrado: {PartidoId}", id);
            return NotFound(new { message = "Partido no encontrado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar partido {PartidoId}", id);
            return StatusCode(500, new { message = "Error al eliminar el partido. Intente nuevamente." });
        }
    }
}
