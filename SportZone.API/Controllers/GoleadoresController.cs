using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoleadoresController : ControllerBase
{
    private readonly IGoleadoresService _goleadoresService;
    private readonly ILogger<GoleadoresController> _logger;

    public GoleadoresController(IGoleadoresService goleadoresService, ILogger<GoleadoresController> logger)
    {
        _goleadoresService = goleadoresService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene la tabla de goleadores de un torneo
    /// </summary>
    [HttpGet("{torneoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGoleadores(Guid torneoId)
    {
        try
        {
            var goleadores = await _goleadoresService.GetTablaGoleadoresAsync(torneoId);
            return Ok(goleadores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener goleadores del torneo {TorneoId}", torneoId);
            return StatusCode(500, new { message = "Error al obtener tabla de goleadores" });
        }
    }
}
