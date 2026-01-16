namespace CoachingApp.Core.Entities;

public class Conversation
{
    public int ConversationId { get; set; }
    public int CoachClientId { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public CoachClient CoachClient { get; set; } = null!;
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
