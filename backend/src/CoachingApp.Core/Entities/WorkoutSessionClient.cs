namespace CoachingApp.Core.Entities;

public class WorkoutSessionClient
{
    public int WorkoutSessionClientId { get; set; }
    public int WorkoutSessionId { get; set; }
    public int AdherentId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public WorkoutSession WorkoutSession { get; set; } = null!;
    public Adherent Adherent { get; set; } = null!;
}
