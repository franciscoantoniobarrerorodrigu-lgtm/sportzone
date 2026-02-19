using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("jugadores")]
public class Jugador : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("equipo_id")]
    public Guid EquipoId { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("numero")]
    public int Numero { get; set; }

    [Column("posicion")]
    public string Posicion { get; set; } = string.Empty;

    [Column("foto_url")]
    public string? FotoUrl { get; set; }

    [Column("activo")]
    public bool Activo { get; set; } = true;
}
