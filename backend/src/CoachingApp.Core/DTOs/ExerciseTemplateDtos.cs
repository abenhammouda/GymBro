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

    // ── Video Import DTOs ──────────────────────────────────

    public class VideoImportRequest
    {
        public string? YoutubeUrl { get; set; }
        public string? ChannelUrl { get; set; }
        public string? DriveUrl { get; set; }
    }

    public class VideoImportResult
    {
        public bool IsSuccess { get; set; }
        public int? ExerciseTemplateId { get; set; }
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? VideoUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? DetectionMethod { get; set; }
        public string? ErrorMessage { get; set; }

        public static VideoImportResult Success(int exerciseTemplateId, string name, string category,
            string videoUrl, string? thumbnailUrl, string detectionMethod) => new()
        {
            IsSuccess = true,
            ExerciseTemplateId = exerciseTemplateId,
            Name = name,
            Category = category,
            VideoUrl = videoUrl,
            ThumbnailUrl = thumbnailUrl,
            DetectionMethod = detectionMethod
        };

        public static VideoImportResult Failure(string videoUrl, string errorMessage) => new()
        {
            IsSuccess = false,
            VideoUrl = videoUrl,
            ErrorMessage = errorMessage
        };
    }

    public class ChannelVideoInfo
    {
        public string Url { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public int? DurationSeconds { get; set; }
    }
}
