using Postgrest.Attributes;
using Postgrest.Models;

namespace SportZone.API.Models.Entities;

[Table("temporadas")]
public class Temporada : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("anio")]
    public int Anio { get; set; }

    [Column("activa")]
    public bool Activa { get; set; }
}
