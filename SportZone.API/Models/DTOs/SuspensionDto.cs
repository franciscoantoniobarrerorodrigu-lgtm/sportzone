namespace SportZone.API.Models.DTOs;

public class SuspensionDto
{
    public Guid Id { get; set; }
    public Guid JugadorId { get; set; }
    public string JugadorNombre { get; set; } = string.Empty;
    public Guid EquipoId { get; set; }
    public string EquipoNombre { get; set; } = string.Empty;
    public string Motivo { get; set; } = string.Empty;
    public int PartidosSuspendidos { get; set; }
    public int PartidosCumplidos { get; set; }
    public bool Activa { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}
