using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("v_goleadores")]
public class VGoleador : BaseModel
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("nombre_completo")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Column("numero_camiseta")]
    public int NumeroCamiseta { get; set; }

    [Column("posicion")]
    public string Posicion { get; set; } = string.Empty;

    [Column("equipo")]
    public string Equipo { get; set; } = string.Empty;

    [Column("escudo_url")]
    public string? EscudoUrl { get; set; }

    [Column("goles")]
    public int Goles { get; set; }

    [Column("torneo_id")]
    public Guid TorneoId { get; set; }
}
