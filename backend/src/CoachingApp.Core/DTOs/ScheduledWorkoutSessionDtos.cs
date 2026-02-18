namespace CoachingApp.Core.DTOs
{
    public class ScheduledWorkoutSessionResponse
    {
        public int ScheduledWorkoutSessionId { get; set; }
        public int WorkoutSessionId { get; set; }
        public int AdherentId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; } // HH:mm format
        public string Status { get; set; } = "scheduled";
        public DateTime CreatedAt { get; set; }
        
        // Nested objects
        public WorkoutSessionResponse? WorkoutSession { get; set; }
        public AdherentBasicInfo? Adherent { get; set; }
    }

    public class AdherentBasicInfo
    {
        public int AdherentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
        public int? Age { get; set; }
    }

    public class CreateScheduledWorkoutRequest
    {
        public int WorkoutSessionId { get; set; }
        public int AdherentId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; } // HH:mm format
    }

    public class UpdateScheduledWorkoutRequest
    {
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; }
        public string? Status { get; set; } // scheduled, completed, cancelled
    }

    public class BulkScheduleRequest
    {
        public int WorkoutSessionId { get; set; }
        public int AdherentId { get; set; }
        public DateTime StartDate { get; set; }
        public int SessionsPerWeek { get; set; } = 2; // Max 2 per day
    }
}
