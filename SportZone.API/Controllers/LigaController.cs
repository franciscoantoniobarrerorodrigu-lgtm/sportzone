using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LigaController : ControllerBase
{
    private readonly ILigaService _ligaService;
    private readonly ILogger<LigaController> _logger;

    public LigaController(ILigaService ligaService, ILogger<LigaController> logger)
    {
        _ligaService = ligaService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene la tabla de posiciones de un torneo
    /// </summary>
    [HttpGet("posiciones/{torneoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPosiciones(Guid torneoId)
    {
        try
        {
            var posiciones = await _ligaService.GetTablaPosicionesAsync(torneoId);
            return Ok(posiciones);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener posiciones del torneo {TorneoId}", torneoId);
            return StatusCode(500, new { message = "Error al obtener tabla de posiciones" });
        }
    }

    /// <summary>
    /// Obtiene todos los torneos activos
    /// </summary>
    [HttpGet("torneos")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTorneos()
    {
        try
        {
            var torneos = await _ligaService.GetTorneosActivosAsync();
            return Ok(torneos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener torneos activos");
            return StatusCode(500, new { message = "Error al obtener torneos" });
        }
    }

    /// <summary>
    /// Obtiene los resultados de una jornada específica
    /// </summary>
    [HttpGet("{torneoId}/jornada/{numero}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetJornada(Guid torneoId, int numero)
    {
        try
        {
            var partidos = await _ligaService.GetResultadosJornadaAsync(torneoId, numero);
            return Ok(partidos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener jornada {Numero} del torneo {TorneoId}", numero, torneoId);
            return StatusCode(500, new { message = "Error al obtener resultados de jornada" });
        }
    }
}
