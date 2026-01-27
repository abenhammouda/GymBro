namespace CoachingApp.Core.DTOs;

public class SendMessageRequest
{
    public int ConversationId { get; set; }
    public string MessageText { get; set; } = string.Empty;
}

public class CreateConversationRequest
{
    public int CoachId { get; set; }
    public int AdherentId { get; set; }
}

public class MessageResponse
{
    public int MessageId { get; set; }
    public int ConversationId { get; set; }
    public int SenderId { get; set; }
    public string SenderType { get; set; } = string.Empty;
    public string MessageText { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? ReadAt { get; set; }
}

