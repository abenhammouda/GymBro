namespace CoachingApp.Core.Entities;

public class Exercise
{
    public int ExerciseId { get; set; }
    public int WorkoutSessionId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public int? Sets { get; set; }
    public int? Reps { get; set; }
    public decimal? WeightKg { get; set; }
    public int? RestSeconds { get; set; }
    public bool IsCompleted { get; set; }
    public string? Notes { get; set; }
    public int OrderIndex { get; set; }

    // Navigation properties
    public WorkoutSession WorkoutSession { get; set; } = null!;
}
