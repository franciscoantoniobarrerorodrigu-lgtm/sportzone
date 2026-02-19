using System.ComponentModel.DataAnnotations;

namespace SportZone.API.Models.DTOs;

public class CreatePartidoDto
{
    [Required(ErrorMessage = "Torneo es requerido")]
    public Guid TorneoId { get; set; }

    [Required(ErrorMessage = "Jornada es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "Jornada debe ser mayor a 0")]
    public int Jornada { get; set; }

    [Required(ErrorMessage = "Equipo Local es requerido")]
    public Guid EquipoLocalId { get; set; }

    [Required(ErrorMessage = "Equipo Visitante es requerido")]
    public Guid EquipoVisitaId { get; set; }

    [Required(ErrorMessage = "Fecha y Hora son requeridas")]
    public DateTime FechaHora { get; set; }

    public string? Estadio { get; set; }

    [Required(ErrorMessage = "Estado es requerido")]
    public string Estado { get; set; } = "programado";
}
