using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("suspensiones")]
public class Suspension : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("jugador_id")]
    public Guid JugadorId { get; set; }

    [Column("equipo_id")]
    public Guid EquipoId { get; set; }

    [Column("motivo")]
    public string Motivo { get; set; } = string.Empty;

    [Column("partidos_suspendidos")]
    public int PartidosSuspendidos { get; set; }

    [Column("partidos_cumplidos")]
    public int PartidosCumplidos { get; set; }

    [Column("activa")]
    public bool Activa { get; set; }

    [Column("fecha_inicio")]
    public DateTime FechaInicio { get; set; }

    [Column("fecha_fin")]
    public DateTime? FechaFin { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
