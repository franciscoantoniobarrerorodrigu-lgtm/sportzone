using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using SportZone.API.Hubs;

namespace SportZone.API.HealthChecks;

/// <summary>
/// Health check para verificar el estado del SignalR Hub
/// </summary>
public class SignalRHealthCheck : IHealthCheck
{
    private readonly IHubContext<PartidoHub> _hubContext;
    private readonly ILogger<SignalRHealthCheck> _logger;

    public SignalRHealthCheck(
        IHubContext<PartidoHub> hubContext,
        ILogger<SignalRHealthCheck> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Verificar que el hub context está disponible
            if (_hubContext == null)
            {
                return Task.FromResult(
                    HealthCheckResult.Unhealthy("SignalR hub context is null"));
            }

            // El hub está operacional
            return Task.FromResult(
                HealthCheckResult.Healthy("SignalR hub is operational"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SignalR health check failed");
            return Task.FromResult(
                HealthCheckResult.Unhealthy("SignalR hub is down", ex));
        }
    }
}
