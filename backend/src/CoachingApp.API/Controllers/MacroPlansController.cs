using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Data;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoachingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MacroPlansController : ControllerBase
{
    private readonly MacroPlanService _service;
    private readonly ILogger<MacroPlansController> _logger;

    public MacroPlansController(MacroPlanService service, ILogger<MacroPlansController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>Plan de macros actif pour un coach-client.</summary>
    [HttpGet("{coachClientId}/current")]
    public async Task<IActionResult> GetCurrentPlan(int coachClientId)
    {
        try
        {
            var plan = await _service.GetCurrentMacroPlanAsync(coachClientId);
            if (plan == null)
                return NotFound(new { message = "Aucun plan de macros actif trouvé" });
            return Ok(plan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current macro plan for CoachClient {CoachClientId}", coachClientId);
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    /// <summary>Historique de tous les plans de macros d'un coach-client.</summary>
    [HttpGet("{coachClientId}/history")]
    public async Task<IActionResult> GetHistory(int coachClientId)
    {
        try
        {
            var history = await _service.GetMacroPlanHistoryAsync(coachClientId);
            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting macro plan history for CoachClient {CoachClientId}", coachClientId);
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    /// <summary>
    /// Crée un nouveau plan de macros (clôture automatiquement le plan actif précédent).
    /// Réservé au coach.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePlan([FromBody] CreateMacroPlanRequest request)
    {
        try
        {
            var plan = await _service.CreateMacroPlanAsync(request);
            return CreatedAtAction(nameof(GetCurrentPlan),
                new { coachClientId = request.CoachClientId }, plan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating macro plan");
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }
}
