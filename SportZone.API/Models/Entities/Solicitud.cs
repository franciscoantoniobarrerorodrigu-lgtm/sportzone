using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("solicitudes")]
public class Solicitud : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [Column("titulo")]
    public string Titulo { get; set; } = string.Empty;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("solicitante")]
    public string? Solicitante { get; set; }

    [Column("equipo_id")]
    public Guid? EquipoId { get; set; }

    [Column("monto")]
    public decimal? Monto { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "pendiente";

    [Column("prioridad")]
    public string Prioridad { get; set; } = "media";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
