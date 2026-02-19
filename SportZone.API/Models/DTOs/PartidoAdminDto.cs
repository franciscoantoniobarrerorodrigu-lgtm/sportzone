namespace SportZone.API.Models.DTOs;

public class PartidoAdminDto
{
    public Guid Id { get; set; }
    public Guid TorneoId { get; set; }
    public string TorneoNombre { get; set; } = string.Empty;
    public int Jornada { get; set; }
    public Guid EquipoLocalId { get; set; }
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public Guid EquipoVisitaId { get; set; }
    public string EquipoVisitaNombre { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public string? Estadio { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? GolesLocal { get; set; }
    public int? GolesVisita { get; set; }
    public DateTime CreatedAt { get; set; }
}
