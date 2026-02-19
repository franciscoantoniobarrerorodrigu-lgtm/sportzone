namespace SportZone.API.Models.DTOs;

public class GenerarFixtureDto
{
    public Guid TorneoId { get; set; }
    public DateTime FechaInicio { get; set; }
    public List<TimeSpan> HorariosDisponibles { get; set; } = new();
    public int DiasMinimosEntrePartidos { get; set; } = 3;
    public bool IdaYVuelta { get; set; } = true;
    public int? Seed { get; set; }
}
