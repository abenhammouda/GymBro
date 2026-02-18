namespace CoachingApp.Core.DTOs
{
    public class ExerciseTemplateResponse
    {
        public int ExerciseTemplateId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Category2 { get; set; }
        public string? Equipment { get; set; }
        public string? VideoUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? Duration { get; set; }
        public string? Instructions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateExerciseTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Category2 { get; set; }
        public string? Description { get; set; }
        public string? Equipment { get; set; }
        public string? Instructions { get; set; }
        public string? VideoUrl { get; set; }
    }

    public class UpdateExerciseTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Category2 { get; set; }
        public string? Description { get; set; }
        public string? Equipment { get; set; }
        public string? Instructions { get; set; }
        public string? VideoUrl { get; set; }
    }

    public class ExerciseSuggestion
    {
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
    }
}
