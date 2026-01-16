using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class Message
{
    public int MessageId { get; set; }
    public int ConversationId { get; set; }
    public int SenderId { get; set; }
    public SenderType SenderType { get; set; }
    public string MessageText { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    // Navigation properties
    public Conversation Conversation { get; set; } = null!;
    public ICollection<MessageAttachment> MessageAttachments { get; set; } = new List<MessageAttachment>();
}
