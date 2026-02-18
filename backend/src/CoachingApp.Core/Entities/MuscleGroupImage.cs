namespace CoachingApp.Core.Entities;

public class MuscleGroupImage
{
    public int MuscleGroupImageId { get; set; }
    public string Category { get; set; } = string.Empty; // UpperBody, LowerBody, Chest, Shoulders, Back, Core, Cardio, Flexibility
    public string ImageUrl { get; set; } = string.Empty; // Local path: /uploads/muscle-group-images/{filename}
    public string ImageFileName { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty; // "Pexels", "Unsplash", etc.
    public string? SourceUrl { get; set; } // Original URL from API
    public int? PexelsId { get; set; } // Pexels photo ID for attribution
    public string? Photographer { get; set; } // Photographer name for attribution
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
