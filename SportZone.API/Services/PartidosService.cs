using Supabase;
using SportZone.API.Models.DTOs;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class PartidosService : IPartidosService
{
    private readonly Client _supabase;
    private readonly ISignalRNotificationService _signalRNotification;
    private readonly ISuspensionManagerService _suspensionManager;
    private readonly INotificationService _notificationService;
    private readonly ILogger<PartidosService> _logger;

    public PartidosService(
        Client supabase, 
        ISignalRNotificationService signalRNotification,
        ISuspensionManagerService suspensionManager,
        INotificationService notificationService,
        ILogger<PartidosService> logger)
    {
        _supabase = supabase;
        _signalRNotification = signalRNotification;
        _suspensionManager = suspensionManager;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<IEnumerable<PartidoDto>> GetPartidosEnVivoAsync()
    {
        try
        {
            // Consultar partidos en vivo o por iniciar
            var partidosResponse = await _supabase
                .From<Partido>()
                .Filter("estado", Postgrest.Constants.Operator.In, new[] { "en_vivo", "por_iniciar" })
                .Order(p => p.FechaHora, Postgrest.Constants.Ordering.Ascending)
                .Get();

            if (partidosResponse?.Models == null || !partidosResponse.Models.Any())
            {
                return Enumerable.Empty<PartidoDto>();
            }

            // Obtener IDs de equipos
            var equipoIds = partidosResponse.Models
                .SelectMany(p => new[] { p.EquipoLocalId, p.EquipoVisitaId })
                .Distinct()
                .ToList();

            // Consultar equipos
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, equipoIds)
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e) 
                ?? new Dictionary<Guid, Equipo>();

            // Mapear a DTOs
            var partidos = partidosResponse.Models.Select(p =>
            {
                var equipoLocal = equipos.GetValueOrDefault(p.EquipoLocalId);
                var equipoVisita = equipos.GetValueOrDefault(p.EquipoVisitaId);

                return new PartidoDto
                {
                    Id = p.Id,
                    Jornada = p.Jornada,
                    FechaHora = p.FechaHora,
                    Estadio = p.Estadio,
                    Estado = p.Estado,
                    GolesLocal = p.GolesLocal,
                    GolesVisita = p.GolesVisita,
                    EquipoLocalNombre = equipoLocal?.Nombre ?? "N/A",
                    EquipoLocalEscudo = equipoLocal?.EscudoUrl,
                    EquipoVisitaNombre = equipoVisita?.Nombre ?? "N/A",
                    EquipoVisitaEscudo = equipoVisita?.EscudoUrl
                };
            });

            return partidos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener partidos en vivo");
            throw;
        }
    }

    public async Task<PartidoDto?> GetPartidoDetalleAsync(Guid partidoId)
    {
        try
        {
            // Consultar partido
            var partidoResponse = await _supabase
                .From<Partido>()
                .Where(p => p.Id == partidoId)
                .Single();

            if (partidoResponse == null)
            {
                return null;
            }

            // Consultar equipos
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, new[] { partidoResponse.EquipoLocalId, partidoResponse.EquipoVisitaId })
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e) 
                ?? new Dictionary<Guid, Equipo>();

            var equipoLocal = equipos.GetValueOrDefault(partidoResponse.EquipoLocalId);
            var equipoVisita = equipos.GetValueOrDefault(partidoResponse.EquipoVisitaId);

            return new PartidoDto
            {
                Id = partidoResponse.Id,
                Jornada = partidoResponse.Jornada,
                FechaHora = partidoResponse.FechaHora,
                Estadio = partidoResponse.Estadio,
                Estado = partidoResponse.Estado,
                GolesLocal = partidoResponse.GolesLocal,
                GolesVisita = partidoResponse.GolesVisita,
                EquipoLocalNombre = equipoLocal?.Nombre ?? "N/A",
                EquipoLocalEscudo = equipoLocal?.EscudoUrl,
                EquipoVisitaNombre = equipoVisita?.Nombre ?? "N/A",
                EquipoVisitaEscudo = equipoVisita?.EscudoUrl
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener detalle del partido {PartidoId}", partidoId);
            throw;
        }
    }

    public async Task IniciarPartidoAsync(Guid partidoId, Guid planilleroId)
    {
        try
        {
            var partido = await _supabase
                .From<Partido>()
                .Where(p => p.Id == partidoId)
                .Single();

            if (partido == null)
            {
                throw new InvalidOperationException("Partido no encontrado");
            }

            partido.Estado = "en_vivo";
            partido.MinutoActual = 0;
            partido.PlanilleroId = planilleroId;

            await partido.Update<Partido>();

            // Obtener nombres de equipos para notificación
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, new[] { partido.EquipoLocalId, partido.EquipoVisitaId })
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e);
            var equipoLocal = equipos?.GetValueOrDefault(partido.EquipoLocalId);
            var equipoVisita = equipos?.GetValueOrDefault(partido.EquipoVisitaId);

            // Notificar vía SignalR
            await _signalRNotification.NotificarPartidoIniciadoAsync(partidoId);

            // Enviar notificación push
            if (equipoLocal != null && equipoVisita != null)
            {
                await _notificationService.EnviarNotificacionInicioPartidoAsync(
                    partidoId,
                    equipoLocal.Nombre,
                    equipoVisita.Nombre,
                    partido.FechaHora
                );
            }

            _logger.LogInformation("Partido {PartidoId} iniciado por planillero {PlanilleroId}", partidoId, planilleroId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al iniciar partido {PartidoId}", partidoId);
            throw;
        }
    }

    public async Task RegistrarEventoAsync(Guid partidoId, CreateEventoDto evento)
    {
        try
        {
            var nuevoEvento = new EventoPartido
            {
                Id = Guid.NewGuid(),
                PartidoId = partidoId,
                Tipo = evento.Tipo,
                Minuto = evento.Minuto,
                JugadorId = evento.JugadorId,
                EquipoId = evento.EquipoId,
                Descripcion = evento.Descripcion,
                CreatedAt = DateTime.UtcNow
            };

            await _supabase.From<EventoPartido>().Insert(nuevoEvento);

            // Obtener información del equipo y jugador para notificaciones
            var equipoResponse = await _supabase
                .From<Equipo>()
                .Where(e => e.Id == evento.EquipoId)
                .Single();

            Jugador? jugadorResponse = null;
            if (evento.JugadorId != Guid.Empty)
            {
                jugadorResponse = await _supabase
                    .From<Jugador>()
                    .Where(j => j.Id == evento.JugadorId)
                    .Single();
            }

            var equipoNombre = equipoResponse?.Nombre ?? "Equipo";
            var jugadorNombre = jugadorResponse?.Nombre ?? "Jugador";

            // Si es gol, actualizar marcador y enviar notificación
            if (evento.Tipo == "gol")
            {
                var partido = await _supabase
                    .From<Partido>()
                    .Where(p => p.Id == partidoId)
                    .Single();

                if (partido != null)
                {
                    if (partido.EquipoLocalId == evento.EquipoId)
                    {
                        partido.GolesLocal = (partido.GolesLocal ?? 0) + 1;
                    }
                    else if (partido.EquipoVisitaId == evento.EquipoId)
                    {
                        partido.GolesVisita = (partido.GolesVisita ?? 0) + 1;
                    }

                    await partido.Update<Partido>();

                    // Notificar marcador actualizado vía SignalR
                    await _signalRNotification.NotificarMarcadorActualizadoAsync(
                        partidoId, partido.GolesLocal, partido.GolesVisita);

                    // Enviar notificación push de gol
                    await _notificationService.EnviarNotificacionGolAsync(
                        partidoId,
                        equipoNombre,
                        jugadorNombre,
                        evento.Minuto
                    );
                }
            }

            // Si es tarjeta, enviar notificación push
            if (evento.Tipo == "tarjeta_amarilla" || evento.Tipo == "tarjeta_roja")
            {
                await _notificationService.EnviarNotificacionTarjetaAsync(
                    partidoId,
                    evento.Tipo,
                    equipoNombre,
                    jugadorNombre,
                    evento.Minuto
                );
            }

            // Notificar evento vía SignalR
            await _signalRNotification.NotificarEventoPartidoAsync(partidoId, new
            {
                id = nuevoEvento.Id,
                tipo = nuevoEvento.Tipo,
                minuto = nuevoEvento.Minuto,
                equipoId = nuevoEvento.EquipoId,
                jugadorId = nuevoEvento.JugadorId,
                descripcion = nuevoEvento.Descripcion
            });

            _logger.LogInformation("Evento {Tipo} registrado en partido {PartidoId} minuto {Minuto}", 
                evento.Tipo, partidoId, evento.Minuto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar evento en partido {PartidoId}", partidoId);
            throw;
        }
    }

    public async Task ActualizarMinutoAsync(Guid partidoId, int minuto)
    {
        try
        {
            var partido = await _supabase
                .From<Partido>()
                .Where(p => p.Id == partidoId)
                .Single();

            if (partido == null)
            {
                throw new InvalidOperationException("Partido no encontrado");
            }

            partido.MinutoActual = minuto;
            await partido.Update<Partido>();

            // Notificar minuto actualizado
            await _signalRNotification.NotificarMinutoActualizadoAsync(partidoId, minuto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar minuto del partido {PartidoId}", partidoId);
            throw;
        }
    }

    public async Task FinalizarPartidoAsync(Guid partidoId)
    {
        try
        {
            var partido = await _supabase
                .From<Partido>()
                .Where(p => p.Id == partidoId)
                .Single();

            if (partido == null)
            {
                throw new InvalidOperationException("Partido no encontrado");
            }

            partido.Estado = "finalizado";
            await partido.Update<Partido>();

            // Obtener nombres de equipos para notificación
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, new[] { partido.EquipoLocalId, partido.EquipoVisitaId })
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e);
            var equipoLocal = equipos?.GetValueOrDefault(partido.EquipoLocalId);
            var equipoVisita = equipos?.GetValueOrDefault(partido.EquipoVisitaId);

            // Verificar y crear suspensiones automáticas
            await _suspensionManager.VerificarSuspensionesAsync(partidoId);

            // Notificar partido finalizado vía SignalR
            await _signalRNotification.NotificarPartidoFinalizadoAsync(partidoId);

            // Enviar notificación push
            if (equipoLocal != null && equipoVisita != null)
            {
                await _notificationService.EnviarNotificacionFinPartidoAsync(
                    partidoId,
                    equipoLocal.Nombre,
                    equipoVisita.Nombre,
                    partido.GolesLocal ?? 0,
                    partido.GolesVisita ?? 0
                );
            }

            _logger.LogInformation("Partido {PartidoId} finalizado y suspensiones verificadas", partidoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al finalizar partido {PartidoId}", partidoId);
            throw;
        }
    }

    public async Task<PartidoAdminDto> CreatePartidoAsync(CreatePartidoDto dto)
    {
        try
        {
            // Validar que los equipos sean diferentes
            if (dto.EquipoLocalId == dto.EquipoVisitaId)
            {
                throw new InvalidOperationException("Un equipo no puede jugar contra sí mismo");
            }

            // Crear el nuevo partido
            var nuevoPartido = new Partido
            {
                Id = Guid.NewGuid(),
                TorneoId = dto.TorneoId,
                Jornada = dto.Jornada,
                EquipoLocalId = dto.EquipoLocalId,
                EquipoVisitaId = dto.EquipoVisitaId,
                FechaHora = dto.FechaHora,
                Estadio = dto.Estadio,
                Estado = dto.Estado,
                GolesLocal = null,
                GolesVisita = null,
                MinutoActual = 0,
                PlanilleroId = null,
                CreatedAt = DateTime.UtcNow
            };

            // Insertar en la base de datos
            await _supabase.From<Partido>().Insert(nuevoPartido);

            // Consultar el partido creado con JOINs para obtener nombres
            var partidoCreado = await GetPartidoByIdAsync(nuevoPartido.Id);

            if (partidoCreado == null)
            {
                throw new InvalidOperationException("Error al recuperar el partido creado");
            }

            _logger.LogInformation(
                "Partido creado exitosamente: {PartidoId}, Torneo: {TorneoId}, Jornada: {Jornada}, {EquipoLocal} vs {EquipoVisita}",
                partidoCreado.Id,
                partidoCreado.TorneoId,
                partidoCreado.Jornada,
                partidoCreado.EquipoLocalNombre,
                partidoCreado.EquipoVisitaNombre
            );

            return partidoCreado;
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear partido");
            throw new InvalidOperationException("Error al guardar el partido. Intente nuevamente.", ex);
        }
    }

    public async Task<PagedResult<PartidoAdminDto>> GetAllPartidosAsync(Guid? torneoId, string? estado, int page, int pageSize)
    {
        try
        {
            // Aplicar ordenamiento y paginación
            var startIndex = (page - 1) * pageSize;
            var endIndex = startIndex + pageSize - 1;

            // Construir query con todos los filtros encadenados
            Postgrest.Responses.ModeledResponse<Partido>? partidosResponse;
            Postgrest.Responses.ModeledResponse<Partido>? countResponse;

            if (torneoId.HasValue && !string.IsNullOrEmpty(estado))
            {
                countResponse = await _supabase.From<Partido>()
                    .Filter("torneo_id", Postgrest.Constants.Operator.Equals, torneoId.Value)
                    .Filter("estado", Postgrest.Constants.Operator.Equals, estado)
                    .Get();

                partidosResponse = await _supabase.From<Partido>()
                    .Filter("torneo_id", Postgrest.Constants.Operator.Equals, torneoId.Value)
                    .Filter("estado", Postgrest.Constants.Operator.Equals, estado)
                    .Order("fecha_hora", Postgrest.Constants.Ordering.Descending)
                    .Range(startIndex, endIndex)
                    .Get();
            }
            else if (torneoId.HasValue)
            {
                countResponse = await _supabase.From<Partido>()
                    .Filter("torneo_id", Postgrest.Constants.Operator.Equals, torneoId.Value)
                    .Get();

                partidosResponse = await _supabase.From<Partido>()
                    .Filter("torneo_id", Postgrest.Constants.Operator.Equals, torneoId.Value)
                    .Order("fecha_hora", Postgrest.Constants.Ordering.Descending)
                    .Range(startIndex, endIndex)
                    .Get();
            }
            else if (!string.IsNullOrEmpty(estado))
            {
                countResponse = await _supabase.From<Partido>()
                    .Filter("estado", Postgrest.Constants.Operator.Equals, estado)
                    .Get();

                partidosResponse = await _supabase.From<Partido>()
                    .Filter("estado", Postgrest.Constants.Operator.Equals, estado)
                    .Order("fecha_hora", Postgrest.Constants.Ordering.Descending)
                    .Range(startIndex, endIndex)
                    .Get();
            }
            else
            {
                countResponse = await _supabase.From<Partido>().Get();

                partidosResponse = await _supabase.From<Partido>()
                    .Order("fecha_hora", Postgrest.Constants.Ordering.Descending)
                    .Range(startIndex, endIndex)
                    .Get();
            }

            var totalCount = countResponse?.Models?.Count ?? 0;
            var partidos = partidosResponse?.Models ?? new List<Partido>();

            if (!partidos.Any())
            {
                return new PagedResult<PartidoAdminDto>
                {
                    Items = new List<PartidoAdminDto>(),
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                };
            }

            // Obtener IDs únicos de torneos y equipos
            var torneoIds = partidos.Select(p => p.TorneoId).Distinct().ToList();
            var equipoIds = partidos
                .SelectMany(p => new[] { p.EquipoLocalId, p.EquipoVisitaId })
                .Distinct()
                .ToList();

            // Consultar torneos
            var torneosResponse = await _supabase
                .From<Torneo>()
                .Filter("id", Postgrest.Constants.Operator.In, torneoIds)
                .Get();

            var torneos = torneosResponse?.Models?.ToDictionary(t => t.Id, t => t) 
                ?? new Dictionary<Guid, Torneo>();

            // Consultar equipos
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, equipoIds)
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e) 
                ?? new Dictionary<Guid, Equipo>();

            // Mapear a PartidoAdminDto
            var partidosDto = partidos.Select(p => new PartidoAdminDto
            {
                Id = p.Id,
                TorneoId = p.TorneoId,
                TorneoNombre = torneos.GetValueOrDefault(p.TorneoId)?.Nombre ?? "N/A",
                Jornada = p.Jornada,
                EquipoLocalId = p.EquipoLocalId,
                EquipoLocalNombre = equipos.GetValueOrDefault(p.EquipoLocalId)?.Nombre ?? "N/A",
                EquipoVisitaId = p.EquipoVisitaId,
                EquipoVisitaNombre = equipos.GetValueOrDefault(p.EquipoVisitaId)?.Nombre ?? "N/A",
                FechaHora = p.FechaHora,
                Estadio = p.Estadio,
                Estado = p.Estado,
                GolesLocal = p.GolesLocal,
                GolesVisita = p.GolesVisita,
                CreatedAt = p.CreatedAt
            }).ToList();

            return new PagedResult<PartidoAdminDto>
            {
                Items = partidosDto,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener partidos. TorneoId: {TorneoId}, Estado: {Estado}, Page: {Page}, PageSize: {PageSize}", 
                torneoId, estado, page, pageSize);
            throw;
        }
    }

    public async Task<PartidoAdminDto?> GetPartidoByIdAsync(Guid id)
    {
        try
        {
            // Consultar el partido
            var partidoResponse = await _supabase
                .From<Partido>()
                .Where(p => p.Id == id)
                .Single();

            if (partidoResponse == null)
            {
                return null;
            }

            // Consultar el torneo
            var torneoResponse = await _supabase
                .From<Torneo>()
                .Where(t => t.Id == partidoResponse.TorneoId)
                .Single();

            // Consultar los equipos
            var equiposResponse = await _supabase
                .From<Equipo>()
                .Filter("id", Postgrest.Constants.Operator.In, new[] { partidoResponse.EquipoLocalId, partidoResponse.EquipoVisitaId })
                .Get();

            var equipos = equiposResponse?.Models?.ToDictionary(e => e.Id, e => e) 
                ?? new Dictionary<Guid, Equipo>();

            var equipoLocal = equipos.GetValueOrDefault(partidoResponse.EquipoLocalId);
            var equipoVisita = equipos.GetValueOrDefault(partidoResponse.EquipoVisitaId);

            // Mapear a PartidoAdminDto
            return new PartidoAdminDto
            {
                Id = partidoResponse.Id,
                TorneoId = partidoResponse.TorneoId,
                TorneoNombre = torneoResponse?.Nombre ?? "N/A",
                Jornada = partidoResponse.Jornada,
                EquipoLocalId = partidoResponse.EquipoLocalId,
                EquipoLocalNombre = equipoLocal?.Nombre ?? "N/A",
                EquipoVisitaId = partidoResponse.EquipoVisitaId,
                EquipoVisitaNombre = equipoVisita?.Nombre ?? "N/A",
                FechaHora = partidoResponse.FechaHora,
                Estadio = partidoResponse.Estadio,
                Estado = partidoResponse.Estado,
                GolesLocal = partidoResponse.GolesLocal,
                GolesVisita = partidoResponse.GolesVisita,
                CreatedAt = partidoResponse.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener partido por ID {PartidoId}", id);
            throw;
        }
    }

    public async Task<PartidoAdminDto> UpdatePartidoAsync(Guid id, UpdatePartidoDto dto)
    {
        try
        {
            // Verificar que el partido existe
            var partidoExistente = await _supabase
                .From<Partido>()
                .Where(p => p.Id == id)
                .Single();

            if (partidoExistente == null)
            {
                throw new InvalidOperationException("Partido no encontrado");
            }

            // Validar que los equipos sean diferentes si se están modificando
            var equipoLocalId = dto.EquipoLocalId ?? partidoExistente.EquipoLocalId;
            var equipoVisitaId = dto.EquipoVisitaId ?? partidoExistente.EquipoVisitaId;

            if (equipoLocalId == equipoVisitaId)
            {
                throw new InvalidOperationException("Un equipo no puede jugar contra sí mismo");
            }

            // Actualizar solo los campos proporcionados (no-null)
            if (dto.TorneoId.HasValue)
            {
                partidoExistente.TorneoId = dto.TorneoId.Value;
            }

            if (dto.Jornada.HasValue)
            {
                partidoExistente.Jornada = dto.Jornada.Value;
            }

            if (dto.EquipoLocalId.HasValue)
            {
                partidoExistente.EquipoLocalId = dto.EquipoLocalId.Value;
            }

            if (dto.EquipoVisitaId.HasValue)
            {
                partidoExistente.EquipoVisitaId = dto.EquipoVisitaId.Value;
            }

            if (dto.FechaHora.HasValue)
            {
                partidoExistente.FechaHora = dto.FechaHora.Value;
            }

            if (dto.Estadio != null)
            {
                partidoExistente.Estadio = dto.Estadio;
            }

            if (dto.Estado != null)
            {
                partidoExistente.Estado = dto.Estado;
            }

            // Actualizar en la base de datos
            await _supabase
                .From<Partido>()
                .Where(p => p.Id == id)
                .Update(partidoExistente);

            // Consultar el partido actualizado con JOINs para obtener nombres
            var partidoActualizado = await GetPartidoByIdAsync(id);

            if (partidoActualizado == null)
            {
                throw new InvalidOperationException("Error al recuperar el partido actualizado");
            }

            _logger.LogInformation(
                "Partido actualizado exitosamente: {PartidoId}, Torneo: {TorneoId}, Jornada: {Jornada}, {EquipoLocal} vs {EquipoVisita}",
                partidoActualizado.Id,
                partidoActualizado.TorneoId,
                partidoActualizado.Jornada,
                partidoActualizado.EquipoLocalNombre,
                partidoActualizado.EquipoVisitaNombre
            );

            return partidoActualizado;
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar partido {PartidoId}", id);
            throw new InvalidOperationException("Error al actualizar el partido. Intente nuevamente.", ex);
        }
    }

    public async Task DeletePartidoAsync(Guid id)
    {
        try
        {
            // Verificar que el partido existe
            var partido = await _supabase
                .From<Partido>()
                .Where(p => p.Id == id)
                .Single();

            if (partido == null)
            {
                throw new InvalidOperationException("Partido no encontrado");
            }

            // Log antes de eliminar
            _logger.LogInformation(
                "Eliminando partido: {PartidoId}, Torneo: {TorneoId}, Jornada: {Jornada}",
                partido.Id,
                partido.TorneoId,
                partido.Jornada
            );

            // Eliminar el partido (cascade delete automático por FK en eventos_partido)
            await _supabase
                .From<Partido>()
                .Where(p => p.Id == id)
                .Delete();

            _logger.LogInformation("Partido eliminado exitosamente: {PartidoId}", id);
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar partido {PartidoId}", id);
            throw new InvalidOperationException("Error al eliminar el partido. Intente nuevamente.", ex);
        }
    }
}
