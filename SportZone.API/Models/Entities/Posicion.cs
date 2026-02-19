using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("posiciones")]
public class Posicion : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("torneo_id")]
    public Guid TorneoId { get; set; }

    [Column("equipo_id")]
    public Guid EquipoId { get; set; }

    [Column("pj")]
    public int PartidosJugados { get; set; }

    [Column("pg")]
    public int PartidosGanados { get; set; }

    [Column("pe")]
    public int PartidosEmpatados { get; set; }

    [Column("pp")]
    public int PartidosPerdidos { get; set; }

    [Column("gf")]
    public int GolesFavor { get; set; }

    [Column("gc")]
    public int GolesContra { get; set; }

    [Column("diferencia")]
    public int Diferencia { get; set; }

    [Column("puntos")]
    public int Puntos { get; set; }
}
