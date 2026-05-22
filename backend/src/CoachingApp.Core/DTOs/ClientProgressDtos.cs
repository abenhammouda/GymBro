using CoachingApp.Core.Enums;

namespace CoachingApp.Core.DTOs;

// ──────────────────────────────────────────────────────
// MacroPlan DTOs
// ──────────────────────────────────────────────────────

public class MacroPlanDto
{
    public int MacroPlanId { get; set; }
    public int CoachClientId { get; set; }
    public int Calories { get; set; }
    public decimal ProteinGrams { get; set; }
    public decimal CarbsGrams { get; set; }
    public decimal FatGrams { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive => EndDate == null;
}

public class CreateMacroPlanRequest
{
    public int CoachClientId { get; set; }
    public int Calories { get; set; }
    public decimal ProteinGrams { get; set; }
    public decimal CarbsGrams { get; set; }
    public decimal FatGrams { get; set; }
    public string? Notes { get; set; }
}

// ──────────────────────────────────────────────────────
// Weekly Progress DTOs
// ──────────────────────────────────────────────────────

public class WeeklyProgressDto
{
    public int ProgressReportId { get; set; }
    public int CoachClientId { get; set; }
    public int WeekNumber { get; set; }
    public DateTime ReportDate { get; set; }
    public decimal? CurrentWeight { get; set; }
    public string? Notes { get; set; }
    public List<ProgressPhotoDto> Photos { get; set; } = new();
}

public class ProgressPhotoDto
{
    public int ProgressPhotoId { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public string PhotoType { get; set; } = string.Empty;
}

public class SubmitWeeklyProgressRequest
{
    public int CoachClientId { get; set; }
    public int WeekNumber { get; set; }
    public decimal? CurrentWeight { get; set; }
    public string? Notes { get; set; }
    // Photo URLs already uploaded via /api/upload
    public List<PhotoUploadItem> Photos { get; set; } = new();
}

public class PhotoUploadItem
{
    public string PhotoUrl { get; set; } = string.Empty;
    public string PhotoType { get; set; } = "Front";  // Front, Side, Back
}

// ──────────────────────────────────────────────────────
// Client / CoachClient status DTOs
// ──────────────────────────────────────────────────────

public class ClientSummaryDto
{
    public int CoachClientId { get; set; }
    public int AdherentId { get; set; }
    public string AdherentName { get; set; } = string.Empty;
    public string? AdherentEmail { get; set; }
    public string? ProfilePicture { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public decimal? Height { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? GoalSummary { get; set; }
    public decimal? LastWeight { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public string? NutritionGoal { get; set; }    // "Deficit" | "Maintenance" | "Surplus"
    public int? CaloriesDelta { get; set; }
}

public class ClientProfileDto
{
    public int CoachClientId { get; set; }
    public AdherentIntakeDto Adherent { get; set; } = null!;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? GoalSummary { get; set; }
    public string? Notes { get; set; }
    public string? InactiveReason { get; set; }
    public MacroPlanDto? CurrentMacroPlan { get; set; }
    public List<WeeklyProgressDto> WeeklyProgress { get; set; } = new();
}

public class AdherentIntakeDto
{
    public int AdherentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? ProfilePicture { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public decimal? Height { get; set; }
    public decimal? InitialWeight { get; set; }
    public string? WorkNature { get; set; }
    public string? GoalType { get; set; }
    public List<IntakePhotoDto> IntakePhotos { get; set; } = new();
}

public class IntakePhotoDto
{
    public int IntakePhotoId { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public string PhotoType { get; set; } = string.Empty;
}

public class UpdateClientStatusRequest
{
    public string Status { get; set; } = string.Empty;    // Active, Paused, Inactive
    public string? InactiveReason { get; set; }
    public DateTime? EndDate { get; set; }
}
