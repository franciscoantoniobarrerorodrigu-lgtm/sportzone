using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("partidos")]
public class Partido : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("torneo_id")]
    public Guid TorneoId { get; set; }

    [Column("jornada")]
    public int Jornada { get; set; }

    [Column("equipo_local_id")]
    public Guid EquipoLocalId { get; set; }

    [Column("equipo_visita_id")]
    public Guid EquipoVisitaId { get; set; }

    [Column("fecha_hora")]
    public DateTime FechaHora { get; set; }

    [Column("estadio")]
    public string? Estadio { get; set; }

    [Column("goles_local")]
    public int? GolesLocal { get; set; }

    [Column("goles_visita")]
    public int? GolesVisita { get; set; }

    [Column("estado")]
    public string Estado { get; set; } = "programado";

    [Column("minuto_actual")]
    public int MinutoActual { get; set; }

    [Column("planillero_id")]
    public Guid? PlanilleroId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

