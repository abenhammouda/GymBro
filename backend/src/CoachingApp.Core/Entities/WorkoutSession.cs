namespace CoachingApp.Core.Entities;

public class WorkoutSession
{
    public int WorkoutSessionId { get; set; }
    public int ProgramDayId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public ProgramDay ProgramDay { get; set; } = null!;
    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
}
