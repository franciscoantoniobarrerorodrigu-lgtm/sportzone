namespace SportZone.API.Models.DTOs;

public class PartidoDto
{
    public Guid Id { get; set; }
    public int Jornada { get; set; }
    public DateTime FechaHora { get; set; }
    public string? Estadio { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? GolesLocal { get; set; }
    public int? GolesVisita { get; set; }
    public string EquipoLocalNombre { get; set; } = string.Empty;
    public string? EquipoLocalEscudo { get; set; }
    public string EquipoVisitaNombre { get; set; } = string.Empty;
    public string? EquipoVisitaEscudo { get; set; }
}
