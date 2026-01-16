using CoachingApp.Core.Enums;
using CoachingApp.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace CoachingApp.Infrastructure.Hubs;

// TODO: Fix JWT authentication for SignalR - currently disabled to allow testing
// [Authorize]
public class MessageHub : Hub
{
    private readonly IMessageService _messageService;
    private readonly ILogger<MessageHub> _logger;
    private static readonly Dictionary<string, string> _userConnections = new();

    public MessageHub(IMessageService messageService, ILogger<MessageHub> logger)
    {
        _messageService = messageService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        var userType = GetUserType();

        if (userId.HasValue)
        {
            var key = $"{userType}_{userId}";
            _userConnections[key] = Context.ConnectionId;
            _logger.LogInformation($"User {userType} {userId} connected with connection ID {Context.ConnectionId}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        var userType = GetUserType();

        if (userId.HasValue)
        {
            var key = $"{userType}_{userId}";
            _userConnections.Remove(key);
            _logger.LogInformation($"User {userType} {userId} disconnected");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(int conversationId, string messageText)
    {
        try
        {
            var userId = GetUserId();
            var userType = GetUserType();

            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "User not authenticated");
                return;
            }

            // Send message through service
            var message = await _messageService.SendMessageAsync(
                userId.Value,
                userType,
                conversationId,
                messageText);

            // Broadcast to conversation group
            await Clients.Group($"conversation_{conversationId}")
                .SendAsync("ReceiveMessage", new
                {
                    message.MessageId,
                    message.ConversationId,
                    message.SenderId,
                    SenderType = message.SenderType.ToString(),
                    message.MessageText,
                    message.SentAt,
                    message.IsRead
                });

            _logger.LogInformation($"Message {message.MessageId} sent in conversation {conversationId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public async Task MarkAsRead(int messageId)
    {
        try
        {
            var userId = GetUserId();
            var userType = GetUserType();

            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "User not authenticated");
                return;
            }

            await _messageService.MarkAsReadAsync(messageId, userId.Value, userType);

            // Notify the sender that their message was read
            await Clients.All.SendAsync("MessageRead", new { messageId });

            _logger.LogInformation($"Message {messageId} marked as read by {userType} {userId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking message as read");
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public async Task JoinConversation(int conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
        _logger.LogInformation($"Connection {Context.ConnectionId} joined conversation {conversationId}");
    }

    public async Task LeaveConversation(int conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
        _logger.LogInformation($"Connection {Context.ConnectionId} left conversation {conversationId}");
    }

    public async Task UserTyping(int conversationId)
    {
        var userId = GetUserId();
        var userType = GetUserType();

        if (userId.HasValue)
        {
            await Clients.OthersInGroup($"conversation_{conversationId}")
                .SendAsync("UserTyping", new { userId, userType = userType.ToString() });
        }
    }

    private int? GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private SenderType GetUserType()
    {
        var userTypeClaim = Context.User?.FindFirst("UserType")?.Value;
        return Enum.TryParse<SenderType>(userTypeClaim, out var userType) ? userType : SenderType.Coach;
    }
}
