using SportZone.API.Models.DTOs;

namespace SportZone.API.Services;

public interface ISuspensionManagerService
{
    Task VerificarSuspensionesAsync(Guid partidoId);
    Task<List<SuspensionDto>> GetSuspensionesActivasAsync(Guid torneoId);
    Task DescontarSuspensionAsync(Guid jugadorId, Guid partidoId);
    Task<bool> ValidarJugadorHabilitadoAsync(Guid jugadorId, Guid partidoId);
}
