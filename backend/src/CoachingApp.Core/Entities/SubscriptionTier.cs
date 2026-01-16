using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class SubscriptionTier
{
    public int SubscriptionTierId { get; set; }
    public SubscriptionTierName Name { get; set; }
    public int? MaxClients { get; set; }
    public decimal MonthlyPrice { get; set; }
    public string? Features { get; set; } // JSON
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<Coach> Coaches { get; set; } = new List<Coach>();
}
