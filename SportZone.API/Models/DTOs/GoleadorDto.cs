namespace SportZone.API.Models.DTOs;

public class GoleadorDto
{
    public int Posicion { get; set; }
    public Guid JugadorId { get; set; }
    public string JugadorNombre { get; set; } = string.Empty;
    public int Numero { get; set; }
    public string EquipoNombre { get; set; } = string.Empty;
    public string EquipoAbreviatura { get; set; } = string.Empty;
    public string? EquipoEscudo { get; set; }
    public int Goles { get; set; }
}
