using SportZone.API.Models.DTOs;

namespace SportZone.API.Services;

public interface IFixtureGeneratorService
{
    Task<List<PartidoDto>> GenerarFixtureAsync(GenerarFixtureDto dto);
    Task<bool> ValidarConflictosAsync(Guid equipoId, DateTime fechaHora);
}
