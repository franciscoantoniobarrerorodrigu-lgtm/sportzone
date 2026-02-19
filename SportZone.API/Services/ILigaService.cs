using SportZone.API.Models.DTOs;

namespace SportZone.API.Services;

public interface ILigaService
{
    Task<IEnumerable<TorneoDto>> GetTorneosActivosAsync();
    Task<IEnumerable<PosicionEquipoDto>> GetTablaPosicionesAsync(Guid torneoId);
    Task<IEnumerable<PartidoDto>> GetResultadosJornadaAsync(Guid torneoId, int numeroJornada);
}
