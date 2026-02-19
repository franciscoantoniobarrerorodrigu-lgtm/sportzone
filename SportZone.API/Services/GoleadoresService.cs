using Supabase;
using SportZone.API.Models.DTOs;
using SportZone.API.Models.Entities;

namespace SportZone.API.Services;

public class GoleadoresService : IGoleadoresService
{
    private readonly Client _supabase;
    private readonly ILogger<GoleadoresService> _logger;

    public GoleadoresService(Client supabase, ILogger<GoleadoresService> logger)
    {
        _supabase = supabase;
        _logger = logger;
    }

    public async Task<IEnumerable<GoleadorDto>> GetTablaGoleadoresAsync(Guid torneoId)
    {
        try
        {
            // Consultar vista de goleadores del torneo
            var goleadoresResponse = await _supabase
                .From<VGoleador>()
                .Where(g => g.TorneoId == torneoId)
                .Order(g => g.Goles, Postgrest.Constants.Ordering.Descending)
                .Get();

            if (goleadoresResponse?.Models == null || !goleadoresResponse.Models.Any())
            {
                return Enumerable.Empty<GoleadorDto>();
            }

            // Mapear a DTOs con posición
            var resultado = goleadoresResponse.Models.Select((g, index) => new GoleadorDto
            {
                Posicion = index + 1,
                JugadorId = g.Id,
                JugadorNombre = g.NombreCompleto,
                Numero = g.NumeroCamiseta,
                EquipoNombre = g.Equipo,
                EquipoAbreviatura = g.Equipo, // La vista no tiene abreviatura separada
                EquipoEscudo = g.EscudoUrl,
                Goles = g.Goles
            });

            return resultado;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tabla de goleadores para torneo {TorneoId}", torneoId);
            throw;
        }
    }
}
