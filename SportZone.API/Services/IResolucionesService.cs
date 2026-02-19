using SportZone.API.Models.DTOs;

namespace SportZone.API.Services;

public interface IResolucionesService
{
    Task<List<ResolucionDto>> GetAllAsync(string? tipo = null, string? estado = null);
    Task<ResolucionDto?> GetByIdAsync(Guid id);
    Task<ResolucionDto> CreateAsync(CreateResolucionDto dto);
    Task<ResolucionDto> AplicarResolucionAsync(Guid id, AplicarResolucionDto dto);
    Task<ResolucionDto> AnularResolucionAsync(Guid id);
    Task DeleteAsync(Guid id);
}
