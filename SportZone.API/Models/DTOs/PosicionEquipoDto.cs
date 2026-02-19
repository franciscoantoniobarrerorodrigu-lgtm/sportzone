namespace SportZone.API.Models.DTOs;

public class PosicionEquipoDto
{
    public int Posicion { get; set; }
    public Guid Id { get; set; }
    public string EquipoNombre { get; set; } = string.Empty;
    public string Abreviatura { get; set; } = string.Empty;
    public string? EscudoUrl { get; set; }
    public int PartidosJugados { get; set; }
    public int PartidosGanados { get; set; }
    public int PartidosEmpatados { get; set; }
    public int PartidosPerdidos { get; set; }
    public int GolesFavor { get; set; }
    public int GolesContra { get; set; }
    public int Puntos { get; set; }
    public int Diferencia { get; set; }
}
