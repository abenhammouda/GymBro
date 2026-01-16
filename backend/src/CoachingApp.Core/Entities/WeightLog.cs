namespace CoachingApp.Core.Entities;

public class WeightLog
{
    public int WeightLogId { get; set; }
    public int AdherentId { get; set; }
    public decimal Weight { get; set; }
    public DateTime LogDate { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Adherent Adherent { get; set; } = null!;
}
