using System.ComponentModel.DataAnnotations;

namespace SportZone.API.Models.DTOs;

public class UpdatePartidoDto
{
    public Guid? TorneoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Jornada debe ser mayor a 0")]
    public int? Jornada { get; set; }

    public Guid? EquipoLocalId { get; set; }

    public Guid? EquipoVisitaId { get; set; }

    public DateTime? FechaHora { get; set; }

    public string? Estadio { get; set; }

    public string? Estado { get; set; }
}
