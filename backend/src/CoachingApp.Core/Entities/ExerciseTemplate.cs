using System;

namespace CoachingApp.Core.Entities
{
    public class ExerciseTemplate
    {
        public int ExerciseTemplateId { get; set; }
        public int CoachId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty; // UpperBody, LowerBody, Core, Cardio, Flexibility, Other
        public string? Equipment { get; set; }
        public string? VideoUrl { get; set; }
        public string? VideoFileName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? Duration { get; set; } // in seconds, nullable
        public string? Instructions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public Coach Coach { get; set; } = null!;
    }
}
