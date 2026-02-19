// ============================================================
// SportZone Pro — Controllers
// ============================================================

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone.API.Models;
using SportZone.API.Services;

namespace SportZone.API.Controllers;

// ── LIGA & POSICIONES ────────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class LigaController : ControllerBase
{
    private readonly ILigaService _liga;
    public LigaController(ILigaService liga) => _liga = liga;

    /// <summary>Tabla de posiciones de un torneo</summary>
    [HttpGet("posiciones/{torneoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPosiciones(Guid torneoId)
    {
        var tabla = await _liga.GetTablaPosicionesAsync(torneoId);
        return Ok(tabla);
    }

    /// <summary>Lista de torneos activos</summary>
    [HttpGet("torneos")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTorneos()
        => Ok(await _liga.GetTorneosActivosAsync());

    /// <summary>Resultados de una jornada</summary>
    [HttpGet("{torneoId}/jornada/{numero}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetJornada(Guid torneoId, int numero)
        => Ok(await _liga.GetResultadosJornadaAsync(torneoId, numero));
}

// ── GOLEADORES ───────────────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class GoleadoresController : ControllerBase
{
    private readonly IGoleadoresService _svc;
    public GoleadoresController(IGoleadoresService svc) => _svc = svc;

    /// <summary>Ranking de goleadores por torneo</summary>
    [HttpGet("{torneoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGoleadores(
        Guid torneoId,
        [FromQuery] int top = 20,
        [FromQuery] Guid? equipoId = null)
    {
        var data = await _svc.GetRankingGoleadoresAsync(torneoId, top, equipoId);
        return Ok(data);
    }

    /// <summary>Ranking de asistidores</summary>
    [HttpGet("{torneoId}/asistencias")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAsistidores(Guid torneoId, [FromQuery] int top = 20)
        => Ok(await _svc.GetRankingAsistidoresAsync(torneoId, top));
}

// ── PARTIDOS / CRONOGRAMA ────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class PartidosController : ControllerBase
{
    private readonly IPartidosService _svc;
    public PartidosController(IPartidosService svc) => _svc = svc;

    /// <summary>Próximos partidos</summary>
    [HttpGet("proximos")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProximos(
        [FromQuery] int dias = 14,
        [FromQuery] Guid? torneoId = null)
        => Ok(await _svc.GetProximosPartidosAsync(dias, torneoId));

    /// <summary>Partido por ID con eventos (timeline)</summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPartido(Guid id)
        => Ok(await _svc.GetPartidoConEventosAsync(id));

    /// <summary>Partido en vivo</summary>
    [HttpGet("en-vivo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEnVivo()
        => Ok(await _svc.GetPartidoEnVivoAsync());

    /// <summary>Crear partido (admin)</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreatePartido([FromBody] CreatePartidoDto dto)
    {
        var partido = await _svc.CreatePartidoAsync(dto);
        return CreatedAtAction(nameof(GetPartido), new { id = partido.Id }, partido);
    }

    /// <summary>Registrar evento del partido (gol, tarjeta, etc.)</summary>
    [HttpPost("{id}/eventos")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> AddEvento(Guid id, [FromBody] CreateEventoDto dto)
    {
        var evento = await _svc.AddEventoAsync(id, dto);
        return Ok(evento);
    }

    /// <summary>Finalizar partido y actualizar posiciones</summary>
    [HttpPatch("{id}/finalizar")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> FinalizarPartido(Guid id, [FromBody] ResultadoDto resultado)
    {
        await _svc.FinalizarPartidoAsync(id, resultado);
        return Ok(new { message = "Partido finalizado. Posiciones actualizadas." });
    }
}

// ── SOLICITUDES / MANDAS ─────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class SolicitudesController : ControllerBase
{
    private readonly ISolicitudesService _svc;
    public SolicitudesController(ISolicitudesService svc) => _svc = svc;

    /// <summary>Listar solicitudes con filtros</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetSolicitudes(
        [FromQuery] string? estado = null,
        [FromQuery] string? tipo = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetSolicitudesAsync(estado, tipo, page, pageSize));

    /// <summary>Obtener solicitud por ID</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetSolicitud(Guid id)
        => Ok(await _svc.GetSolicitudAsync(id));

    /// <summary>Crear nueva solicitud</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateSolicitud([FromBody] CreateSolicitudDto dto)
    {
        var sol = await _svc.CreateSolicitudAsync(dto);
        return CreatedAtAction(nameof(GetSolicitud), new { id = sol.Id }, sol);
    }

    /// <summary>Actualizar estado (aprobar/rechazar)</summary>
    [HttpPatch("{id}/estado")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateEstado(Guid id, [FromBody] UpdateEstadoDto dto)
    {
        await _svc.UpdateEstadoSolicitudAsync(id, dto.Estado, dto.Comentario);
        return NoContent();
    }
}

// ── RESOLUCIONES ─────────────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class ResolucionesController : ControllerBase
{
    private readonly IResolucionesService _svc;
    public ResolucionesController(IResolucionesService svc) => _svc = svc;

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetResoluciones(
        [FromQuery] string? tipo = null,
        [FromQuery] string? estado = null,
        [FromQuery] int page = 1)
        => Ok(await _svc.GetResolucionesAsync(tipo, estado, page));

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetResolucion(Guid id)
        => Ok(await _svc.GetResolucionAsync(id));

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateResolucion([FromBody] CreateResolucionDto dto)
    {
        var res = await _svc.CreateResolucionAsync(dto);
        return CreatedAtAction(nameof(GetResolucion), new { id = res.Id }, res);
    }

    [HttpPatch("{id}/estado")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] UpdateEstadoDto dto)
    {
        await _svc.CambiarEstadoAsync(id, dto.Estado);
        return NoContent();
    }
}

// ── MARKETING ────────────────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
public class MarketingController : ControllerBase
{
    private readonly IMarketingService _svc;
    public MarketingController(IMarketingService svc) => _svc = svc;

    [HttpGet("campanas")]
    [Authorize(Policy = "Marketing")]
    public async Task<IActionResult> GetCampanas([FromQuery] string? estado = null)
        => Ok(await _svc.GetCampanasAsync(estado));

    [HttpPost("campanas")]
    [Authorize(Policy = "Marketing")]
    public async Task<IActionResult> CreateCampana([FromBody] CreateCampanaDto dto)
        => Ok(await _svc.CreateCampanaAsync(dto));

    [HttpGet("patrocinadores")]
    [Authorize(Policy = "Marketing")]
    public async Task<IActionResult> GetPatrocinadores()
        => Ok(await _svc.GetPatrocinadoresAsync());

    [HttpGet("metricas")]
    [Authorize(Policy = "Marketing")]
    public async Task<IActionResult> GetMetricas()
        => Ok(await _svc.GetMetricasDashboardAsync());
}

// ── SIGNALR HUB (Partidos en Vivo) ──────────────────────────
using Microsoft.AspNetCore.SignalR;

public class PartidoHub : Hub
{
    // El cliente Angular se suscribe así:
    // connection.invoke("SuscribirPartido", partidoId)
    public async Task SuscribirPartido(string partidoId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"partido-{partidoId}");

    public async Task DesuscribirPartido(string partidoId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"partido-{partidoId}");
}
