using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class CoachClient
{
    public int CoachClientId { get; set; }
    public int CoachId { get; set; }
    public int AdherentId { get; set; }
    public CoachClientStatus Status { get; set; } = CoachClientStatus.Active;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }           // date de fin de la souscription
    public string? InactiveReason { get; set; }      // raison du passage en Inactive
    public string? GoalSummary { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Coach Coach { get; set; } = null!;
    public Adherent Adherent { get; set; } = null!;
    public ICollection<Program> Programs { get; set; } = new List<Program>();
    public ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
    public ICollection<MacroPlan> MacroPlans { get; set; } = new List<MacroPlan>();
}

