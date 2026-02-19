using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("resoluciones")]
public class Resolucion : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("numero")]
    public string Numero { get; set; } = string.Empty;

    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [Column("asunto")]
    public string Asunto { get; set; } = string.Empty;

    [Column("motivo")]
    public string? Motivo { get; set; }

    [Column("sancion_tipo")]
    public string? SancionTipo { get; set; }

    [Column("sancion_valor")]
    public int? SancionValor { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "borrador";

    [Column("fecha_emision")]
    public DateTime? FechaEmision { get; set; }

    [Column("solicitud_id")]
    public Guid? SolicitudId { get; set; }

    [Column("equipo_id")]
    public Guid? EquipoId { get; set; }

    [Column("jugador_id")]
    public Guid? JugadorId { get; set; }

    [Column("partido_id")]
    public Guid? PartidoId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
