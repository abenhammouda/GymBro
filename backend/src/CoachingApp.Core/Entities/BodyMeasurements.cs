namespace CoachingApp.Core.Entities;

public class BodyMeasurements
{
    public int MeasurementId { get; set; }
    public int ProgressReportId { get; set; }
    public int AdherentId { get; set; }
    public decimal? Chest { get; set; }
    public decimal? Waist { get; set; }
    public decimal? Hips { get; set; }
    public decimal? Thighs { get; set; }
    public decimal? Arms { get; set; }
    public DateTime MeasurementDate { get; set; }

    // Navigation properties
    public ProgressReport ProgressReport { get; set; } = null!;
}
