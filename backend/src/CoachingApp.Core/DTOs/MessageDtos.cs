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
