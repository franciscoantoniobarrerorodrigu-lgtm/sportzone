namespace SportZone.API.Models.DTOs;

public class CreateEventoDto
{
    public int Minuto { get; set; }
    public string Tipo { get; set; } = string.Empty; // gol, tarjeta_amarilla, tarjeta_roja, sustitucion
    public Guid JugadorId { get; set; }
    public Guid? AsistenteId { get; set; }
    public Guid EquipoId { get; set; }
    public string? Descripcion { get; set; }
}
