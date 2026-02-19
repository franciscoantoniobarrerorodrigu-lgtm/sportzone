using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("equipos")]
public class Equipo : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("abreviatura")]
    public string Abreviatura { get; set; } = string.Empty;

    [Column("ciudad")]
    public string? Ciudad { get; set; }

    [Column("estadio")]
    public string? Estadio { get; set; }

    [Column("escudo_url")]
    public string? EscudoUrl { get; set; }

    [Column("color_primario")]
    public string? ColorPrimario { get; set; }

    [Column("color_secundario")]
    public string? ColorSecundario { get; set; }

    [Column("activo")]
    public bool Activo { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

