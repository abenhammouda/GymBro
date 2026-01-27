using CoachingApp.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoachingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebugController : ControllerBase
{
    private readonly IConversationRepository _conversationRepository;
    private readonly ILogger<DebugController> _logger;

    public DebugController(
        IConversationRepository conversationRepository,
        ILogger<DebugController> logger)
    {
        _conversationRepository = conversationRepository;
        _logger = logger;
    }

    [HttpGet("conversation/{conversationId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetConversationDebug(int conversationId)
    {
        try
        {
            _logger.LogInformation($"Debug: Getting conversation {conversationId}");
            
            var conversation = await _conversationRepository.GetConversationByIdAsync(conversationId);
            
            if (conversation == null)
            {
                return NotFound(new { message = "Conversation not found" });
            }

            var result = new
            {
                ConversationId = conversation.ConversationId,
                CoachClientId = conversation.CoachClientId,
                CoachClientIsNull = conversation.CoachClient == null,
                CoachId = conversation.CoachClient?.CoachId,
                AdherentId = conversation.CoachClient?.AdherentId,
                CoachName = conversation.CoachClient?.Coach?.Name,
                AdherentName = conversation.CoachClient?.Adherent?.Name,
                MessageCount = conversation.Messages?.Count ?? 0
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error in debug endpoint for conversation {conversationId}");
            return StatusCode(500, new { 
                message = "Error", 
                error = ex.Message,
                stackTrace = ex.StackTrace 
            });
        }
    }
}
