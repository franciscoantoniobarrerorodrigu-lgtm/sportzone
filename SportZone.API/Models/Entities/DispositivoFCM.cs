using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("dispositivos_fcm")]
public class DispositivoFCM : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("usuario_id")]
    public Guid UsuarioId { get; set; }

    [Column("token")]
    public string Token { get; set; } = string.Empty;

    [Column("plataforma")]
    public string Plataforma { get; set; } = string.Empty;

    [Column("activo")]
    public bool Activo { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
