using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class ProgressPhoto
{
    public int ProgressPhotoId { get; set; }
    public int ProgressReportId { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public PhotoType PhotoType { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ProgressReport ProgressReport { get; set; } = null!;
}
