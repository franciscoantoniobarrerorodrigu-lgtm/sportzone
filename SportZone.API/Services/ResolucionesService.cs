using Supabase;
using SportZone.API.Models.DTOs;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class ResolucionesService : IResolucionesService
{
    private readonly Client _supabase;
    private readonly ILogger<ResolucionesService> _logger;

    public ResolucionesService(Client supabase, ILogger<ResolucionesService> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    public async Task<List<ResolucionDto>> GetAllAsync(string? tipo = null, string? estado = null)
    {
        try
        {
            var baseQuery = _supabase.From<Resolucion>();

            // Build query with filters
            if (!string.IsNullOrEmpty(tipo) && !string.IsNullOrEmpty(estado))
            {
                var response = await baseQuery
                    .Where(r => r.Tipo == tipo)
                    .Where(r => r.Estado == estado)
                    .Order(r => r.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToResolucionDtos(response.Models);
            }
            else if (!string.IsNullOrEmpty(tipo))
            {
                var response = await baseQuery
                    .Where(r => r.Tipo == tipo)
                    .Order(r => r.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToResolucionDtos(response.Models);
            }
            else if (!string.IsNullOrEmpty(estado))
            {
                var response = await baseQuery
                    .Where(r => r.Estado == estado)
                    .Order(r => r.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToResolucionDtos(response.Models);
            }
            else
            {
                var response = await baseQuery
                    .Order(r => r.CreatedAt, Postgrest.Constants.Ordering.Descending)
                    .Get();
                return await MapToResolucionDtos(response.Models);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener resoluciones");
            throw;
        }
    }

    private async Task<List<ResolucionDto>> MapToResolucionDtos(IEnumerable<Resolucion> resoluciones)
    {
        var result = new List<ResolucionDto>();

        foreach (var resolucion in resoluciones)
        {
            string? equipoNombre = null;
            string? jugadorNombre = null;

            if (resolucion.EquipoId.HasValue)
            {
                var equipoResponse = await _supabase
                    .From<Equipo>()
                    .Where(e => e.Id == resolucion.EquipoId.Value)
                    .Single();

                equipoNombre = equipoResponse?.Nombre;
            }

            if (resolucion.JugadorId.HasValue)
            {
                var jugadorResponse = await _supabase
                    .From<Jugador>()
                    .Where(j => j.Id == resolucion.JugadorId.Value)
                    .Single();

                jugadorNombre = jugadorResponse?.Nombre;
            }

            result.Add(new ResolucionDto
            {
                Id = resolucion.Id,
                Numero = resolucion.Numero,
                Tipo = resolucion.Tipo,
                Asunto = resolucion.Asunto,
                Motivo = resolucion.Motivo,
                SancionTipo = resolucion.SancionTipo,
                SancionValor = resolucion.SancionValor,
                Estado = resolucion.Estado,
                FechaEmision = resolucion.FechaEmision,
                SolicitudId = resolucion.SolicitudId,
                EquipoId = resolucion.EquipoId,
                EquipoNombre = equipoNombre,
                JugadorId = resolucion.JugadorId,
                JugadorNombre = jugadorNombre,
                PartidoId = resolucion.PartidoId,
                CreatedAt = resolucion.CreatedAt
            });
        }

        return result;
    }

    public async Task<ResolucionDto?> GetByIdAsync(Guid id)
    {
        try
        {
            var resolucion = await _supabase
                .From<Resolucion>()
                .Where(r => r.Id == id)
                .Single();

            if (resolucion == null) return null;

            string? equipoNombre = null;
            string? jugadorNombre = null;

            if (resolucion.EquipoId.HasValue)
            {
                var equipoResponse = await _supabase
                    .From<Equipo>()
                    .Where(e => e.Id == resolucion.EquipoId.Value)
                    .Single();

                equipoNombre = equipoResponse?.Nombre;
            }

            if (resolucion.JugadorId.HasValue)
            {
                var jugadorResponse = await _supabase
                    .From<Jugador>()
                    .Where(j => j.Id == resolucion.JugadorId.Value)
                    .Single();

                jugadorNombre = jugadorResponse?.Nombre;
            }

            return new ResolucionDto
            {
                Id = resolucion.Id,
                Numero = resolucion.Numero,
                Tipo = resolucion.Tipo,
                Asunto = resolucion.Asunto,
                Motivo = resolucion.Motivo,
                SancionTipo = resolucion.SancionTipo,
                SancionValor = resolucion.SancionValor,
                Estado = resolucion.Estado,
                FechaEmision = resolucion.FechaEmision,
                SolicitudId = resolucion.SolicitudId,
                EquipoId = resolucion.EquipoId,
                EquipoNombre = equipoNombre,
                JugadorId = resolucion.JugadorId,
                JugadorNombre = jugadorNombre,
                PartidoId = resolucion.PartidoId,
                CreatedAt = resolucion.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener resolución {Id}", id);
            throw;
        }
    }

    public async Task<ResolucionDto> CreateAsync(CreateResolucionDto dto)
    {
        try
        {
            // Generar número de resolución
            var año = DateTime.UtcNow.Year;
            var resolucionesDelAño = await _supabase
                .From<Resolucion>()
                .Where(r => r.Numero.StartsWith($"RES-{año}"))
                .Get();

            var numero = $"RES-{año}-{(resolucionesDelAño.Models.Count + 1):D3}";

            var resolucion = new Resolucion
            {
                Id = Guid.NewGuid(),
                Numero = numero,
                Tipo = dto.Tipo,
                Asunto = dto.Asunto,
                Motivo = dto.Motivo,
                SancionTipo = dto.SancionTipo,
                SancionValor = dto.SancionValor,
                Estado = "borrador",
                SolicitudId = dto.SolicitudId,
                EquipoId = dto.EquipoId,
                JugadorId = dto.JugadorId,
                PartidoId = dto.PartidoId,
                CreatedAt = DateTime.UtcNow
            };

            await _supabase.From<Resolucion>().Insert(resolucion);

            _logger.LogInformation("Resolución creada: {Numero}", numero);

            return (await GetByIdAsync(resolucion.Id))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear resolución");
            throw;
        }
    }

    public async Task<ResolucionDto> AplicarResolucionAsync(Guid id, AplicarResolucionDto dto)
    {
        try
        {
            var resolucion = await _supabase
                .From<Resolucion>()
                .Where(r => r.Id == id)
                .Single();

            if (resolucion == null)
            {
                throw new InvalidOperationException("Resolución no encontrada");
            }

            if (resolucion.Estado != "borrador")
            {
                throw new InvalidOperationException("Solo se pueden aplicar resoluciones en estado borrador");
            }

            // Aplicar la sanción según el tipo
            if (resolucion.SancionTipo == "suspension" && resolucion.JugadorId.HasValue && resolucion.SancionValor.HasValue)
            {
                // Crear suspensión administrativa
                var suspension = new Suspension
                {
                    Id = Guid.NewGuid(),
                    JugadorId = resolucion.JugadorId.Value,
                    EquipoId = resolucion.EquipoId ?? Guid.Empty,
                    Motivo = $"Resolución {resolucion.Numero}: {resolucion.Asunto}",
                    PartidosSuspendidos = resolucion.SancionValor.Value,
                    PartidosCumplidos = 0,
                    Activa = true,
                    FechaInicio = dto.FechaEmision,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _supabase.From<Suspension>().Insert(suspension);
            }

            // Actualizar estado de la resolución
            resolucion.Estado = "emitida";
            resolucion.FechaEmision = dto.FechaEmision;

            await _supabase.From<Resolucion>().Update(resolucion);

            _logger.LogInformation("Resolución {Numero} aplicada", resolucion.Numero);

            return (await GetByIdAsync(id))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al aplicar resolución {Id}", id);
            throw;
        }
    }

    public async Task<ResolucionDto> AnularResolucionAsync(Guid id)
    {
        try
        {
            var resolucion = await _supabase
                .From<Resolucion>()
                .Where(r => r.Id == id)
                .Single();

            if (resolucion == null)
            {
                throw new InvalidOperationException("Resolución no encontrada");
            }

            resolucion.Estado = "anulada";

            await _supabase.From<Resolucion>().Update(resolucion);

            _logger.LogInformation("Resolución {Numero} anulada", resolucion.Numero);

            return (await GetByIdAsync(id))!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al anular resolución {Id}", id);
            throw;
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var resolucion = await _supabase
                .From<Resolucion>()
                .Where(r => r.Id == id)
                .Single();

            if (resolucion == null)
            {
                throw new InvalidOperationException("Resolución no encontrada");
            }

            if (resolucion.Estado == "emitida")
            {
                throw new InvalidOperationException("No se puede eliminar una resolución emitida. Debe anularla primero.");
            }

            await _supabase.From<Resolucion>().Delete(resolucion);

            _logger.LogInformation("Resolución {Numero} eliminada", resolucion.Numero);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar resolución {Id}", id);
            throw;
        }
    }
}
