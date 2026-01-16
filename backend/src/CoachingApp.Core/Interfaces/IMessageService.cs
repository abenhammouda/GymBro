using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Interfaces;

public interface IMessageService
{
    Task<Message> SendMessageAsync(int senderId, SenderType senderType, int conversationId, string messageText);
    Task<IEnumerable<Conversation>> GetConversationsAsync(int userId, SenderType userType);
    Task<IEnumerable<Message>> GetMessagesAsync(int conversationId, int userId, SenderType userType);
    Task MarkAsReadAsync(int messageId, int userId, SenderType userType);
    Task<int> GetUnreadCountAsync(int userId, SenderType userType);
    Task<Conversation> GetOrCreateConversationAsync(int coachId, int adherentId);
}
