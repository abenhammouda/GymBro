using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class Program
{
    public int ProgramId { get; set; }
    public int CoachClientId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ProgramStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public CoachClient CoachClient { get; set; } = null!;
    public ICollection<ProgramDay> ProgramDays { get; set; } = new List<ProgramDay>();
    public ICollection<ProgressReport> ProgressReports { get; set; } = new List<ProgressReport>();
}
