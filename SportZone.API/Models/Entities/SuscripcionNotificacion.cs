using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("suscripciones_notificaciones")]
public class SuscripcionNotificacion : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("usuario_id")]
    public Guid UsuarioId { get; set; }

    [Column("partido_id")]
    public Guid? PartidoId { get; set; }

    [Column("equipo_id")]
    public Guid? EquipoId { get; set; }

    [Column("tipo_evento")]
    public string? TipoEvento { get; set; }

    [Column("activa")]
    public bool Activa { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
