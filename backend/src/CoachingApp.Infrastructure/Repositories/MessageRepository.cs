using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly CoachingDbContext _context;

    public MessageRepository(CoachingDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(int conversationId)
    {
        return await _context.Messages
            .AsNoTracking() // Prevent loading navigation properties
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId, Core.Enums.SenderType userType)
    {
        // Get conversations for this user
        var conversations = await _context.Conversations
            .Include(c => c.CoachClient)
            .Where(c => userType == Core.Enums.SenderType.Coach 
                ? c.CoachClient.CoachId == userId 
                : c.CoachClient.AdherentId == userId)
            .Select(c => c.ConversationId)
            .ToListAsync();

        // Count unread messages in these conversations where the user is NOT the sender
        return await _context.Messages
            .Where(m => conversations.Contains(m.ConversationId) 
                && !m.IsRead 
                && !(m.SenderId == userId && m.SenderType == userType))
            .CountAsync();
    }

    public async Task<Message> AddAsync(Message message)
    {
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<Message?> GetMessageByIdAsync(int messageId)
    {
        return await _context.Messages
            .Include(m => m.Conversation)
                .ThenInclude(c => c.CoachClient)
                    .ThenInclude(cc => cc.Coach)
            .Include(m => m.Conversation)
                .ThenInclude(c => c.CoachClient)
                    .ThenInclude(cc => cc.Adherent)
            .FirstOrDefaultAsync(m => m.MessageId == messageId);
    }

    public async Task MarkAsReadAsync(int messageId)
    {
        var message = await _context.Messages.FindAsync(messageId);
        if (message != null && !message.IsRead)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
