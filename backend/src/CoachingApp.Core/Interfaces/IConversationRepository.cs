using CoachingApp.Core.Entities;

namespace CoachingApp.Core.Interfaces;

public interface IConversationRepository
{
    Task<IEnumerable<Conversation>> GetConversationsByUserAsync(int userId, Enums.SenderType userType);
    Task<Conversation?> GetConversationByIdAsync(int conversationId);
    Task<Conversation?> GetConversationByCoachClientIdAsync(int coachClientId);
    Task<Conversation> GetOrCreateConversationAsync(int coachId, int adherentId);
    Task UpdateLastMessageTimeAsync(int conversationId);
}
