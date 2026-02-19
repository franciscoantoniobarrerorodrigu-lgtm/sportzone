using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Models.DTOs;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ResolucionesController : ControllerBase
{
    private readonly IResolucionesService _resolucionesService;

    public ResolucionesController(IResolucionesService resolucionesService)
    {
        _resolucionesService = resolucionesService;
    }

    /// <summary>
    /// Obtiene todas las resoluciones con filtros opcionales
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tipo = null, [FromQuery] string? estado = null)
    {
        try
        {
            var resoluciones = await _resolucionesService.GetAllAsync(tipo, estado);
            return Ok(new
            {
                success = true,
                data = resoluciones,
                total = resoluciones.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al obtener resoluciones", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene una resolución por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var resolucion = await _resolucionesService.GetByIdAsync(id);

            if (resolucion == null)
            {
                return NotFound(new { success = false, message = "Resolución no encontrada" });
            }

            return Ok(new { success = true, data = resolucion });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al obtener resolución", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva resolución en estado borrador
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateResolucionDto dto)
    {
        try
        {
            var resolucion = await _resolucionesService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = resolucion.Id }, new { success = true, data = resolucion });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al crear resolución", error = ex.Message });
        }
    }

    /// <summary>
    /// Aplica una resolución (cambia estado a emitida y ejecuta la sanción)
    /// </summary>
    [HttpPost("{id}/aplicar")]
    public async Task<IActionResult> Aplicar(Guid id, [FromBody] AplicarResolucionDto dto)
    {
        try
        {
            var resolucion = await _resolucionesService.AplicarResolucionAsync(id, dto);
            return Ok(new { success = true, data = resolucion, message = "Resolución aplicada exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al aplicar resolución", error = ex.Message });
        }
    }

    /// <summary>
    /// Anula una resolución
    /// </summary>
    [HttpPost("{id}/anular")]
    public async Task<IActionResult> Anular(Guid id)
    {
        try
        {
            var resolucion = await _resolucionesService.AnularResolucionAsync(id);
            return Ok(new { success = true, data = resolucion, message = "Resolución anulada exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al anular resolución", error = ex.Message });
        }
    }

    /// <summary>
    /// Elimina una resolución (solo si está en borrador)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _resolucionesService.DeleteAsync(id);
            return Ok(new { success = true, message = "Resolución eliminada exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al eliminar resolución", error = ex.Message });
        }
    }
}
