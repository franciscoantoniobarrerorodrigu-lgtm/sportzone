using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Models.DTOs;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FixtureController : ControllerBase
{
    private readonly IFixtureGeneratorService _fixtureService;

    public FixtureController(IFixtureGeneratorService fixtureService)
    {
        _fixtureService = fixtureService;
    }

    /// <summary>
    /// Genera el fixture completo para un torneo usando algoritmo Round-Robin
    /// </summary>
    /// <param name="dto">Parámetros de generación del fixture</param>
    /// <returns>Lista de partidos generados</returns>
    [HttpPost("generar")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<PartidoDto>>> GenerarFixture([FromBody] GenerarFixtureDto dto)
    {
        try
        {
            var partidos = await _fixtureService.GenerarFixtureAsync(dto);
            return Ok(new
            {
                success = true,
                message = $"Fixture generado exitosamente con {partidos.Count} partidos",
                data = partidos
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al generar fixture", error = ex.Message });
        }
    }

    /// <summary>
    /// Valida si un equipo tiene conflictos de horario en una fecha específica
    /// </summary>
    /// <param name="equipoId">ID del equipo</param>
    /// <param name="fechaHora">Fecha y hora a validar</param>
    /// <returns>True si no hay conflictos, False si hay conflictos</returns>
    [HttpGet("validar-conflictos")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<bool>> ValidarConflictos([FromQuery] Guid equipoId, [FromQuery] DateTime fechaHora)
    {
        try
        {
            var sinConflictos = await _fixtureService.ValidarConflictosAsync(equipoId, fechaHora);
            return Ok(new
            {
                success = true,
                equipoId,
                fechaHora,
                sinConflictos,
                message = sinConflictos ? "No hay conflictos" : "El equipo ya tiene un partido programado ese día"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al validar conflictos", error = ex.Message });
        }
    }
}
