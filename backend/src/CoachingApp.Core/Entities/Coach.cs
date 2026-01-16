using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class Coach
{
    public int CoachId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public string? Bio { get; set; }
    public string? Specialization { get; set; }
    public int? SubscriptionTierId { get; set; }
    public DateTime? SubscriptionStartDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public bool IsEmailVerified { get; set; } = false;
    public bool IsPhoneVerified { get; set; } = false;
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiry { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public SubscriptionTier? SubscriptionTier { get; set; }
    public ICollection<CoachClient> CoachClients { get; set; } = new List<CoachClient>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
