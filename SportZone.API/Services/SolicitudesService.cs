using Supabase;
using SportZone.API.Models.DTOs;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class SolicitudesService : ISolicitudesService
{
    private readonly Client _supabase;
    private readonly ILogger<SolicitudesService> _logger;

    public SolicitudesService(Client supabase, ILogger<SolicitudesService> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    public async Task<List<SolicitudDto>> GetAllAsync(string? tipo = null, string? estado = null)
    {
        try
        {
            var baseQuery = _supabase.From<Solicitud>();

            // Build query with filters
            if (!string.IsNullOrEmpty(tipo) && !string.IsNullOrEmpty(estado))
            {
                var response = await baseQuery
                    .Where(s => s.Tipo == tipo)
                    .Where(s => s.Estado == estado)
                    .Order(s => s.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToSolicitudDtos(response.Models);
            }
            else if (!string.IsNullOrEmpty(tipo))
            {
                var response = await baseQuery
                    .Where(s => s.Tipo == tipo)
                    .Order(s => s.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToSolicitudDtos(response.Models);
            }
            else if (!string.IsNullOrEmpty(estado))
            {
                var response = await baseQuery
                    .Where(s => s.Estado == estado)
                    .Order(s => s.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToSolicitudDtos(response.Models);
            }
            else
            {
                var response = await baseQuery
                    .Order(s => s.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToSolicitudDtos(response.Models);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener solicitudes");
            throw;
        }
    }

    private async Task<List<SolicitudDto>> MapToSolicitudDtos(IEnumerable<Solicitud> solicitudes)
    {
        var result = new List<SolicitudDto>();

        foreach (var solicitud in solicitudes)
        {
            string? equipoNombre = null;

            if (solicitud.EquipoId.HasValue)
            {
                var equipoResponse = await _supabase
                    .From<Equipo>()
                    .Where(e => e.Id == solicitud.EquipoId.Value)
                    .Single();

                equipoNombre = equipoResponse?.Nombre;
            }

            result.Add(new SolicitudDto
            {
                Id = solicitud.Id,
                Tipo = solicitud.Tipo,
                Titulo = solicitud.Titulo,
                Descripcion = solicitud.Descripcion,
                Solicitante = solicitud.Solicitante,
                EquipoId = solicitud.EquipoId,
                EquipoNombre = equipoNombre,
                Monto = solicitud.Monto,
                Estado = solicitud.Estado,
                Prioridad = solicitud.Prioridad,
                CreatedAt = solicitud.CreatedAt,
                UpdatedAt = solicitud.UpdatedAt
            });
        }

        return result;
    }

    public async Task<SolicitudDto?> GetByIdAsync(Guid id)
    {
        try
        {
            var solicitud = await _supabase
                .From<Solicitud>()
                .Where(s => s.Id == id)
                .Single();

            if (solicitud == null) return null;

            string? equipoNombre = null;

            if (solicitud.EquipoId.HasValue)
            {
                var equipoResponse = await _supabase
                    .From<Equipo>()
                    .Where(e => e.Id == solicitud.EquipoId.Value)
                    .Single();

                equipoNombre = equipoResponse?.Nombre;
            }

            return new SolicitudDto
            {
                Id = solicitud.Id,
                Tipo = solicitud.Tipo,
                Titulo = solicitud.Titulo,
                Descripcion = solicitud.Descripcion,
                Solicitante = solicitud.Solicitante,
                EquipoId = solicitud.EquipoId,
                EquipoNombre = equipoNombre,
                Monto = solicitud.Monto,
                Estado = solicitud.Estado,
                Prioridad = solicitud.Prioridad,
                CreatedAt = solicitud.CreatedAt,
                UpdatedAt = solicitud.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener solicitud {Id}", id);
            throw;
        }
    }

    public async Task<SolicitudDto> CreateAsync(CreateSolicitudDto dto)
    {
        try
        {
            var solicitud = new Solicitud
            {
                Id = Guid.NewGuid(),
                Tipo = dto.Tipo,
                Titulo = dto.Titulo,
                Descripcion = dto.Descripcion,
                Solicitante = dto.Solicitante,
                EquipoId = dto.EquipoId,
                Monto = dto.Monto,
                Estado = "pendiente",
                Prioridad = dto.Prioridad,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _supabase.From<Solicitud>().Insert(solicitud);

            _logger.LogInformation("Solicitud creada: {Id}", solicitud.Id);

            return (await GetByIdAsync(solicitud.Id))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear solicitud");
            throw;
        }
    }

    public async Task<SolicitudDto> UpdateAsync(Guid id, UpdateSolicitudDto dto)
    {
        try
        {
            var solicitud = await _supabase
                .From<Solicitud>()
                .Where(s => s.Id == id)
                .Single();

            if (solicitud == null)
            {
                throw new InvalidOperationException("Solicitud no encontrada");
            }

            if (!string.IsNullOrEmpty(dto.Titulo))
                solicitud.Titulo = dto.Titulo;

            if (dto.Descripcion != null)
                solicitud.Descripcion = dto.Descripcion;

            if (!string.IsNullOrEmpty(dto.Estado))
                solicitud.Estado = dto.Estado;

            if (!string.IsNullOrEmpty(dto.Prioridad))
                solicitud.Prioridad = dto.Prioridad;

            solicitud.UpdatedAt = DateTime.UtcNow;

            await _supabase.From<Solicitud>().Update(solicitud);

            _logger.LogInformation("Solicitud actualizada: {Id}", id);

            return (await GetByIdAsync(id))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar solicitud {Id}", id);
            throw;
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var solicitud = await _supabase
                .From<Solicitud>()
                .Where(s => s.Id == id)
                .Single();

            if (solicitud == null)
            {
                throw new InvalidOperationException("Solicitud no encontrada");
            }

            await _supabase.From<Solicitud>().Delete(solicitud);

            _logger.LogInformation("Solicitud eliminada: {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar solicitud {Id}", id);
            throw;
        }
    }

    public async Task<SolicitudDto> CambiarEstadoAsync(Guid id, string nuevoEstado)
    {
        try
        {
            var solicitud = await _supabase
                .From<Solicitud>()
                .Where(s => s.Id == id)
                .Single();

            if (solicitud == null)
            {
                throw new InvalidOperationException("Solicitud no encontrada");
            }

            solicitud.Estado = nuevoEstado;
            solicitud.UpdatedAt = DateTime.UtcNow;

            await _supabase.From<Solicitud>().Update(solicitud);

            _logger.LogInformation("Estado de solicitud {Id} cambiado a {Estado}", id, nuevoEstado);

            return (await GetByIdAsync(id))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar estado de solicitud {Id}", id);
            throw;
        }
    }
}
