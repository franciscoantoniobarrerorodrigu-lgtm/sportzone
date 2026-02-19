namespace SportZone.API.Models.DTOs;

public class TorneoDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int TotalJornadas { get; set; }
    public bool Activo { get; set; }
    public string TemporadaNombre { get; set; } = string.Empty;
}
