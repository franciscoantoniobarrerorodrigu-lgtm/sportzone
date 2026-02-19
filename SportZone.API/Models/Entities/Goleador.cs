using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("goleadores")]
public class Goleador : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("torneo_id")]
    public Guid TorneoId { get; set; }

    [Column("jugador_id")]
    public Guid JugadorId { get; set; }

    [Column("equipo_id")]
    public Guid EquipoId { get; set; }

    [Column("goles")]
    public int Goles { get; set; }
}
