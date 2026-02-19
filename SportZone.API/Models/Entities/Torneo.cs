using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("torneos")]
public class Torneo : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [Column("total_jornadas")]
    public int TotalJornadas { get; set; }

    [Column("activo")]
    public bool Activo { get; set; }

    [Column("temporada_id")]
    public Guid TemporadaId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
