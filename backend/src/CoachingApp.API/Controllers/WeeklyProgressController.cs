using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoachingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WeeklyProgressController : ControllerBase
{
    private readonly WeeklyProgressService _service;
    private readonly ILogger<WeeklyProgressController> _logger;

    public WeeklyProgressController(WeeklyProgressService service, ILogger<WeeklyProgressController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// L'adhérent soumet son progrès hebdomadaire (poids + photos).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> SubmitProgress([FromBody] SubmitWeeklyProgressRequest request)
    {
        try
        {
            var adherentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (adherentIdClaim == null)
                return Unauthorized();

            var adherentId = int.Parse(adherentIdClaim.Value);
            var result = await _service.SubmitWeeklyProgressAsync(adherentId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting weekly progress");
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    /// <summary>
    /// Retourne toutes les semaines de progrès d'un coach-client (pour les graphiques).
    /// Accessible par le coach et l'adhérent concerné.
    /// </summary>
    [HttpGet("{coachClientId}")]
    public async Task<IActionResult> GetProgress(int coachClientId)
    {
        try
        {
            var progress = await _service.GetWeeklyProgressAsync(coachClientId);
            return Ok(progress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting weekly progress for CoachClient {CoachClientId}", coachClientId);
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }
}
