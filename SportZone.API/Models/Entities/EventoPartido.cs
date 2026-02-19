using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("eventos_partido")]
public class EventoPartido : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("partido_id")]
    public Guid PartidoId { get; set; }

    [Column("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [Column("minuto")]
    public int Minuto { get; set; }

    [Column("jugador_id")]
    public Guid? JugadorId { get; set; }

    [Column("equipo_id")]
    public Guid EquipoId { get; set; }

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
