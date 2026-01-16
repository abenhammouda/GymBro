using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class Payment
{
    public int PaymentId { get; set; }
    public int CoachId { get; set; }
    public int SubscriptionTierId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public DateTime PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? TransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Coach Coach { get; set; } = null!;
    public SubscriptionTier SubscriptionTier { get; set; } = null!;
}
