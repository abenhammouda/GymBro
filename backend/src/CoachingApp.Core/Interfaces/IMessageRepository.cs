using CoachingApp.Core.Entities;

namespace CoachingApp.Core.Interfaces;

public interface IMessageRepository
{
    Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(int conversationId);
    Task<int> GetUnreadCountAsync(int userId, Enums.SenderType userType);
    Task<Message> AddAsync(Message message);
    Task<Message?> GetMessageByIdAsync(int messageId);
    Task MarkAsReadAsync(int messageId);
}
