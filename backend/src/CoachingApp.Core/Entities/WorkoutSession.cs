namespace CoachingApp.Core.Entities;

public class WorkoutSession
{
    public int WorkoutSessionId { get; set; }
    public int CoachId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VoiceMessageUrl { get; set; }
    public string? VoiceMessageFileName { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImageFileName { get; set; }
    public string Category { get; set; } = string.Empty; // UpperBody, LowerBody, Core, Cardio, etc.
    public string Status { get; set; } = "Draft"; // Active, Draft, Archived
    public int? Duration { get; set; } // Duration in minutes
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Coach Coach { get; set; } = null!;
    public ICollection<WorkoutSessionExercise> Exercises { get; set; } = new List<WorkoutSessionExercise>();
    public ICollection<WorkoutSessionClient> AssignedClients { get; set; } = new List<WorkoutSessionClient>();
}
