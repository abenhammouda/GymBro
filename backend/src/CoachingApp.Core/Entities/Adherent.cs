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
    public bool IsEmailVerified { get; set; } = false;
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiry { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<CoachClient> CoachClients { get; set; } = new List<CoachClient>();
    public ICollection<WeightLog> WeightLogs { get; set; } = new List<WeightLog>();
}
