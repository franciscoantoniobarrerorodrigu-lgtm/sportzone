using SportZone.API.Models.DTOs;

namespace SportZone.API.Services;

public interface ISolicitudesService
{
    Task<List<SolicitudDto>> GetAllAsync(string? tipo = null, string? estado = null);
    Task<SolicitudDto?> GetByIdAsync(Guid id);
    Task<SolicitudDto> CreateAsync(CreateSolicitudDto dto);
    Task<SolicitudDto> UpdateAsync(Guid id, UpdateSolicitudDto dto);
    Task DeleteAsync(Guid id);
    Task<SolicitudDto> CambiarEstadoAsync(Guid id, string nuevoEstado);
}
