using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class Adherent
{
    public int AdherentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public decimal? Height { get; set; }
    public decimal? InitialWeight { get; set; }          // poids lors de la souscription (kg)
    public WorkNature? WorkNature { get; set; }          // nature du travail
    public GoalType? GoalType { get; set; }              // objectif fitness
    public NutritionGoal? NutritionGoal { get; set; }    // déficit / maintien / surplus
    public int? CaloriesDelta { get; set; }              // écart kcal vs maintien (négatif=déficit, positif=surplus)
    public bool IsEmailVerified { get; set; } = false;
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiry { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<CoachClient> CoachClients { get; set; } = new List<CoachClient>();
    public ICollection<WeightLog> WeightLogs { get; set; } = new List<WeightLog>();
    public ICollection<IntakePhoto> IntakePhotos { get; set; } = new List<IntakePhoto>();
}
