using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly CoachingDbContext _context;

    public ConversationRepository(CoachingDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Conversation>> GetConversationsByUserAsync(int userId, Core.Enums.SenderType userType)
    {
        return await _context.Conversations
            .Include(c => c.CoachClient)
                .ThenInclude(cc => cc.Coach)
            .Include(c => c.CoachClient)
                .ThenInclude(cc => cc.Adherent)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .Where(c => userType == Core.Enums.SenderType.Coach 
                ? c.CoachClient.CoachId == userId 
                : c.CoachClient.AdherentId == userId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Conversation?> GetConversationByIdAsync(int conversationId)
    {
        return await _context.Conversations
            .Include(c => c.CoachClient)
                .ThenInclude(cc => cc.Coach)
            .Include(c => c.CoachClient)
                .ThenInclude(cc => cc.Adherent)
            .Include(c => c.Messages) // Messages will be sorted in memory
            .FirstOrDefaultAsync(c => c.ConversationId == conversationId);
    }

    public async Task<Conversation?> GetConversationByCoachClientIdAsync(int coachClientId)
    {
        return await _context.Conversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.CoachClientId == coachClientId);
    }

    public async Task<Conversation> GetOrCreateConversationAsync(int coachId, int adherentId)
    {
        // Find the CoachClient relationship
        var coachClient = await _context.CoachClients
            .FirstOrDefaultAsync(cc => cc.CoachId == coachId && cc.AdherentId == adherentId);

        if (coachClient == null)
            throw new InvalidOperationException("No coach-client relationship exists between these users");

        // Check if conversation already exists
        var conversation = await GetConversationByCoachClientIdAsync(coachClient.CoachClientId);
        
        if (conversation != null)
            return conversation;

        // Create new conversation
        conversation = new Conversation
        {
            CoachClientId = coachClient.CoachClientId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        return conversation;
    }

    public async Task UpdateLastMessageTimeAsync(int conversationId)
    {
        var conversation = await _context.Conversations.FindAsync(conversationId);
        if (conversation != null)
        {
            conversation.LastMessageAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
