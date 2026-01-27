using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly ILogger<MessageService> _logger;

    public MessageService(
        IMessageRepository messageRepository,
        IConversationRepository conversationRepository,
        ILogger<MessageService> logger)
    {
        _messageRepository = messageRepository;
        _conversationRepository = conversationRepository;
        _logger = logger;
    }

    public async Task<Message> SendMessageAsync(int senderId, SenderType senderType, int conversationId, string messageText)
    {
        // Validate message text
        if (string.IsNullOrWhiteSpace(messageText))
            throw new ArgumentException("Message text cannot be empty");

        if (messageText.Length > 5000)
            throw new ArgumentException("Message text is too long (max 5000 characters)");

        // Verify conversation exists and user has access
        var conversation = await _conversationRepository.GetConversationByIdAsync(conversationId);
        if (conversation == null)
            throw new InvalidOperationException("Conversation not found");

        // Verify user is part of this conversation
        bool hasAccess = senderType == SenderType.Coach
            ? conversation.CoachClient.CoachId == senderId
            : conversation.CoachClient.AdherentId == senderId;

        if (!hasAccess)
            throw new UnauthorizedAccessException("You don't have access to this conversation");

        // Create message
        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            SenderType = senderType,
            MessageText = messageText,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        var savedMessage = await _messageRepository.AddAsync(message);
        await _conversationRepository.UpdateLastMessageTimeAsync(conversationId);

        _logger.LogInformation($"Message sent by {senderType} {senderId} in conversation {conversationId}");

        return savedMessage;
    }

    public async Task<IEnumerable<Conversation>> GetConversationsAsync(int userId, SenderType userType)
    {
        return await _conversationRepository.GetConversationsByUserAsync(userId, userType);
    }

    public async Task<IEnumerable<Message>> GetMessagesAsync(int conversationId, int userId, SenderType userType)
    {
        _logger.LogInformation($"GetMessagesAsync: conversationId={conversationId}, userId={userId}, userType={userType}");
        
        // Verify user has access to this conversation
        var conversation = await _conversationRepository.GetConversationByIdAsync(conversationId);
        
        if (conversation == null)
        {
            _logger.LogWarning($"Conversation {conversationId} not found");
            throw new InvalidOperationException($"Conversation {conversationId} not found");
        }

        _logger.LogInformation($"Conversation found: ConversationId={conversation.ConversationId}, CoachClientId={conversation.CoachClientId}");
        
        if (conversation.CoachClient == null)
        {
            _logger.LogError($"CoachClient is null for conversation {conversationId}. CoachClientId in DB: {conversation.CoachClientId}. This indicates a database integrity issue - the CoachClient with ID {conversation.CoachClientId} does not exist or was not loaded properly.");
            throw new InvalidOperationException($"Database integrity error: Conversation {conversationId} references CoachClient {conversation.CoachClientId} which does not exist or could not be loaded. Please check your database.");
        }

        _logger.LogInformation($"CoachClient loaded: CoachId={conversation.CoachClient.CoachId}, AdherentId={conversation.CoachClient.AdherentId}");

        bool hasAccess = userType == SenderType.Coach
            ? conversation.CoachClient.CoachId == userId
            : conversation.CoachClient.AdherentId == userId;

        _logger.LogInformation($"Access check: hasAccess={hasAccess}, userType={userType}, userId={userId}");

        if (!hasAccess)
        {
            _logger.LogWarning($"User {userId} ({userType}) denied access to conversation {conversationId}. Conversation belongs to Coach {conversation.CoachClient.CoachId} and Adherent {conversation.CoachClient.AdherentId}");
            throw new UnauthorizedAccessException("You don't have access to this conversation");
        }

        return await _messageRepository.GetMessagesByConversationIdAsync(conversationId);
    }

    public async Task MarkAsReadAsync(int messageId, int userId, SenderType userType)
    {
        var message = await _messageRepository.GetMessageByIdAsync(messageId);
        if (message == null)
            throw new InvalidOperationException("Message not found");

        // Verify user has access to this conversation
        var conversation = message.Conversation;
        bool hasAccess = userType == SenderType.Coach
            ? conversation.CoachClient.CoachId == userId
            : conversation.CoachClient.AdherentId == userId;

        if (!hasAccess)
            throw new UnauthorizedAccessException("You don't have access to this message");

        // Only mark as read if the user is NOT the sender
        if (message.SenderId != userId || message.SenderType != userType)
        {
            await _messageRepository.MarkAsReadAsync(messageId);
        }
    }

    public async Task<int> GetUnreadCountAsync(int userId, SenderType userType)
    {
        return await _messageRepository.GetUnreadCountAsync(userId, userType);
    }

    public async Task<Conversation> GetOrCreateConversationAsync(int coachId, int adherentId)
    {
        return await _conversationRepository.GetOrCreateConversationAsync(coachId, adherentId);
    }
}
