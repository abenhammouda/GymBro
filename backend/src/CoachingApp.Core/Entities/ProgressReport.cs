namespace CoachingApp.Core.Entities;

public class ProgressReport
{
    public int ProgressReportId { get; set; }
    public int ProgramId { get; set; }
    public int AdherentId { get; set; }
    public DateTime ReportDate { get; set; }
    public decimal? CurrentWeight { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Program Program { get; set; } = null!;
    public ICollection<ProgressPhoto> ProgressPhotos { get; set; } = new List<ProgressPhoto>();
    public BodyMeasurements? BodyMeasurements { get; set; }
}
