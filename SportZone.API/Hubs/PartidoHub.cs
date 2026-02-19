using Microsoft.AspNetCore.SignalR;

namespace SportZone.API.Hubs;

public class PartidoHub : Hub
{
    private readonly ILogger<PartidoHub> _logger;

    public PartidoHub(ILogger<PartidoHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Suscribe al cliente a un partido específico
    /// </summary>
    public async Task SuscribirPartido(string partidoId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"partido_{partidoId}");
        await Clients.Caller.SendAsync("Suscrito", partidoId);
        _logger.LogInformation("Cliente {ConnectionId} suscrito al partido {PartidoId}", 
            Context.ConnectionId, partidoId);
    }

    /// <summary>
    /// Desuscribe al cliente de un partido
    /// </summary>
    public async Task DesuscribirPartido(string partidoId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"partido_{partidoId}");
        await Clients.Caller.SendAsync("Desuscrito", partidoId);
        _logger.LogInformation("Cliente {ConnectionId} desuscrito del partido {PartidoId}", 
            Context.ConnectionId, partidoId);
    }

    /// <summary>
    /// Suscribe al cliente a todos los partidos en vivo
    /// </summary>
    public async Task SuscribirPartidosEnVivo()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "partidos_en_vivo");
        await Clients.Caller.SendAsync("SuscritoEnVivo");
        _logger.LogInformation("Cliente {ConnectionId} suscrito a partidos en vivo", 
            Context.ConnectionId);
    }

    /// <summary>
    /// Desuscribe al cliente de partidos en vivo
    /// </summary>
    public async Task DesuscribirPartidosEnVivo()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "partidos_en_vivo");
        await Clients.Caller.SendAsync("DesuscritoEnVivo");
        _logger.LogInformation("Cliente {ConnectionId} desuscrito de partidos en vivo", 
            Context.ConnectionId);
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        _logger.LogInformation("Cliente conectado: {ConnectionId}", Context.ConnectionId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        if (exception != null)
        {
            _logger.LogError(exception, "Cliente desconectado con error: {ConnectionId}", Context.ConnectionId);
        }
        else
        {
            _logger.LogInformation("Cliente desconectado: {ConnectionId}", Context.ConnectionId);
        }
    }
}
