using SportZone.API.Models.DTOs;

namespace SportZone.API.Services;

public interface IGoleadoresService
{
    Task<IEnumerable<GoleadorDto>> GetTablaGoleadoresAsync(Guid torneoId);
}
