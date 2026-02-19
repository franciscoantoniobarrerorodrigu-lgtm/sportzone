namespace SportZone.API.Models.DTOs;

public class SolicitudDto
{
    public Guid Id { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Solicitante { get; set; }
    public Guid? EquipoId { get; set; }
    public string? EquipoNombre { get; set; }
    public decimal? Monto { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string Prioridad { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateSolicitudDto
{
    public string Tipo { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Solicitante { get; set; }
    public Guid? EquipoId { get; set; }
    public decimal? Monto { get; set; }
    public string Prioridad { get; set; } = "media";
}

public class UpdateSolicitudDto
{
    public string? Titulo { get; set; }
    public string? Descripcion { get; set; }
    public string? Estado { get; set; }
    public string? Prioridad { get; set; }
}
