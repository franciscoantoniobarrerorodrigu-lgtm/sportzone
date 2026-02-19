using SportZone.API.Models.DTOs;

namespace SportZone.API.Services;

public interface IPartidosService
{
    Task<IEnumerable<PartidoDto>> GetPartidosEnVivoAsync();
    Task<PartidoDto?> GetPartidoDetalleAsync(Guid partidoId);
    Task IniciarPartidoAsync(Guid partidoId, Guid planilleroId);
    Task RegistrarEventoAsync(Guid partidoId, CreateEventoDto evento);
    Task ActualizarMinutoAsync(Guid partidoId, int minuto);
    Task FinalizarPartidoAsync(Guid partidoId);
    
    // Admin CRUD operations
    Task<PartidoAdminDto> CreatePartidoAsync(CreatePartidoDto dto);
    Task<PagedResult<PartidoAdminDto>> GetAllPartidosAsync(Guid? torneoId, string? estado, int page, int pageSize);
    Task<PartidoAdminDto?> GetPartidoByIdAsync(Guid id);
    Task<PartidoAdminDto> UpdatePartidoAsync(Guid id, UpdatePartidoDto dto);
    Task DeletePartidoAsync(Guid id);
}
