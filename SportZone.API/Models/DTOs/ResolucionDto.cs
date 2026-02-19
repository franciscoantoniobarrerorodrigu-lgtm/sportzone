namespace SportZone.API.Models.DTOs;

public class ResolucionDto
{
    public Guid Id { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string? SancionTipo { get; set; }
    public int? SancionValor { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime? FechaEmision { get; set; }
    public Guid? SolicitudId { get; set; }
    public Guid? EquipoId { get; set; }
    public string? EquipoNombre { get; set; }
    public Guid? JugadorId { get; set; }
    public string? JugadorNombre { get; set; }
    public Guid? PartidoId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateResolucionDto
{
    public string Tipo { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string? SancionTipo { get; set; }
    public int? SancionValor { get; set; }
    public Guid? SolicitudId { get; set; }
    public Guid? EquipoId { get; set; }
    public Guid? JugadorId { get; set; }
    public Guid? PartidoId { get; set; }
}

public class AplicarResolucionDto
{
    public DateTime FechaEmision { get; set; }
}
