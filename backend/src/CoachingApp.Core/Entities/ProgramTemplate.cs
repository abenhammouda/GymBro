using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class ProgramTemplate
{
    public int ProgramTemplateId { get; set; }
    public int CoachId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProgramStatus Status { get; set; } = ProgramStatus.Draft;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Duration { get; set; } // in weeks
    public int? CurrentWeek { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImageFileName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Coach Coach { get; set; } = null!;
}
