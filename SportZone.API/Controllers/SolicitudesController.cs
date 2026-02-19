using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Models.DTOs;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class SolicitudesController : ControllerBase
{
    private readonly ISolicitudesService _solicitudesService;

    public SolicitudesController(ISolicitudesService solicitudesService)
    {
        _solicitudesService = solicitudesService;
    }

    /// <summary>
    /// Obtiene todas las solicitudes con filtros opcionales
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tipo = null, [FromQuery] string? estado = null)
    {
        try
        {
            var solicitudes = await _solicitudesService.GetAllAsync(tipo, estado);
            return Ok(new
            {
                success = true,
                data = solicitudes,
                total = solicitudes.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al obtener solicitudes", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene una solicitud por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var solicitud = await _solicitudesService.GetByIdAsync(id);

            if (solicitud == null)
            {
                return NotFound(new { success = false, message = "Solicitud no encontrada" });
            }

            return Ok(new { success = true, data = solicitud });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al obtener solicitud", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea una nueva solicitud
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSolicitudDto dto)
    {
        try
        {
            var solicitud = await _solicitudesService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = solicitud.Id }, new { success = true, data = solicitud });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al crear solicitud", error = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza una solicitud existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSolicitudDto dto)
    {
        try
        {
            var solicitud = await _solicitudesService.UpdateAsync(id, dto);
            return Ok(new { success = true, data = solicitud });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al actualizar solicitud", error = ex.Message });
        }
    }

    /// <summary>
    /// Cambia el estado de una solicitud
    /// </summary>
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] CambiarEstadoRequest request)
    {
        try
        {
            var solicitud = await _solicitudesService.CambiarEstadoAsync(id, request.Estado);
            return Ok(new { success = true, data = solicitud });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al cambiar estado", error = ex.Message });
        }
    }

    /// <summary>
    /// Elimina una solicitud
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _solicitudesService.DeleteAsync(id);
            return Ok(new { success = true, message = "Solicitud eliminada exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al eliminar solicitud", error = ex.Message });
        }
    }
}

public record CambiarEstadoRequest(string Estado);
