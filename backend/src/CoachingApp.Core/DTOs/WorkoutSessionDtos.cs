namespace CoachingApp.Core.DTOs
{
    // Response DTOs
    public class WorkoutSessionResponse
    {
        public int WorkoutSessionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? VoiceMessageUrl { get; set; }
        public string? CoverImageUrl { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int ExerciseCount { get; set; }
        public int? Duration { get; set; } // Duration in minutes
        public List<WorkoutSessionExerciseDto> Exercises { get; set; } = new();
        public List<AssignedClientResponse> AssignedClients { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class WorkoutSessionExerciseDto
    {
        public int WorkoutSessionExerciseId { get; set; }
        public int ExerciseTemplateId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string? ExerciseCategory { get; set; }
        public string? ExerciseVideoUrl { get; set; }
        public string? ExerciseThumbnailUrl { get; set; }
        public int OrderIndex { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int RestSeconds { get; set; }
        public string? Notes { get; set; }
    }

    // Request DTOs
    public class CreateWorkoutSessionRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        public int? Duration { get; set; } // Duration in minutes
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<CreateWorkoutSessionExerciseRequest> Exercises { get; set; } = new();
    }

    public class CreateWorkoutSessionExerciseRequest
    {
        public int ExerciseTemplateId { get; set; }
        public int OrderIndex { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public int RestSeconds { get; set; } = 60;
        public string? Notes { get; set; }
    }

    public class UpdateWorkoutSessionRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        public int? Duration { get; set; } // Duration in minutes
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<CreateWorkoutSessionExerciseRequest> Exercises { get; set; } = new();
    }

    // Client Assignment DTOs
    public class AssignedClientResponse
    {
        public int AdherentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
        public int? Age { get; set; }
        public string? Goal { get; set; }
    }

    public class AssignClientsRequest
    {
        public List<int> AdherentIds { get; set; } = new();
    }
}
