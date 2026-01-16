using CoachingApp.Core.DTOs;
using CoachingApp.Core.Enums;
using CoachingApp.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoachingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(IMessageService messageService, ILogger<MessagesController> logger)
    {
        _messageService = messageService;
        _logger = logger;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        try
        {
            var (userId, userType) = GetUserInfo();
            var conversations = await _messageService.GetConversationsAsync(userId, userType);

            var result = conversations.Select(c => new
            {
                c.ConversationId,
                c.CoachClientId,
                ParticipantName = userType == SenderType.Coach 
                    ? c.CoachClient.Adherent.Name 
                    : c.CoachClient.Coach.Name,
                LastMessage = c.Messages
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => new
                    {
                        m.MessageId,
                        m.ConversationId,
                        m.SenderId,
                        SenderType = m.SenderType.ToString(),
                        m.MessageText,
                        m.IsRead,
                        m.SentAt,
                        m.ReadAt
                    })
                    .FirstOrDefault(),
                UnreadCount = c.Messages.Count(m => !m.IsRead && m.SenderId != userId),
                c.LastMessageAt,
                c.CreatedAt
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting conversations");
            return StatusCode(500, new { message = "An error occurred while getting conversations" });
        }
    }

    [HttpGet("conversation/{conversationId}")]
    public async Task<IActionResult> GetMessages(int conversationId)
    {
        try
        {
            _logger.LogInformation($"GetMessages called for conversation {conversationId}");
            var (userId, userType) = GetUserInfo();
            _logger.LogInformation($"User: {userId}, Type: {userType}");
            
            var messages = await _messageService.GetMessagesAsync(conversationId, userId, userType);
            _logger.LogInformation($"Retrieved {messages.Count()} messages");

            return Ok(messages);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, $"Unauthorized access to conversation {conversationId}");
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, $"Conversation {conversationId} not found");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting messages for conversation {conversationId}");
            return StatusCode(500, new { message = "An error occurred while getting messages", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        try
        {
            var (userId, userType) = GetUserInfo();
            var message = await _messageService.SendMessageAsync(
                userId,
                userType,
                request.ConversationId,
                request.MessageText);

            return Ok(message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            return StatusCode(500, new { message = "An error occurred while sending message" });
        }
    }

    [HttpPut("{messageId}/read")]
    public async Task<IActionResult> MarkAsRead(int messageId)
    {
        try
        {
            var (userId, userType) = GetUserInfo();
            await _messageService.MarkAsReadAsync(messageId, userId, userType);

            return Ok(new { message = "Message marked as read" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking message as read");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            var (userId, userType) = GetUserInfo();
            var count = await _messageService.GetUnreadCountAsync(userId, userType);

            return Ok(new { unreadCount = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    [HttpPost("conversation")]
    public async Task<IActionResult> GetOrCreateConversation([FromBody] CreateConversationRequest request)
    {
        try
        {
            var conversation = await _messageService.GetOrCreateConversationAsync(request.CoachId, request.AdherentId);
            return Ok(conversation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating conversation");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    private (int userId, SenderType userType) GetUserInfo()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userTypeClaim = User.FindFirst("UserType")?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid user ID");

        if (!Enum.TryParse<SenderType>(userTypeClaim, out var userType))
            throw new UnauthorizedAccessException("Invalid user type");

        return (userId, userType);
    }
}
