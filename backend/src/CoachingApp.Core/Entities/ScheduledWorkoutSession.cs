namespace CoachingApp.Core.Entities
{
    public class ScheduledWorkoutSession
    {
        public int ScheduledWorkoutSessionId { get; set; }
        public int WorkoutSessionId { get; set; }
        public int AdherentId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public TimeSpan? ScheduledTime { get; set; }
        public string Status { get; set; } = "scheduled"; // scheduled, completed, cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public WorkoutSession WorkoutSession { get; set; } = null!;
        public Adherent Adherent { get; set; } = null!;
    }
}
