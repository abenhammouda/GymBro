using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CoachingApp.API.Controllers;

[Authorize(Roles = "Coach")]
[ApiController]
[Route("api/supplement-sets")]
public class SupplementSetsController : ControllerBase
{
    private readonly SupplementSetService _service;
    private readonly ILogger<SupplementSetsController> _logger;

    public SupplementSetsController(SupplementSetService service, ILogger<SupplementSetsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<SupplementSetResponse>>> GetAll()
    {
        try
        {
            var coachId = GetCoachId();
            var sets = await _service.GetAllAsync(coachId);
            return Ok(sets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting supplement sets");
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    [HttpPost("next")]
    public async Task<ActionResult<SupplementSetResponse>> AddNext([FromQuery] string kind)
    {
        try
        {
            var coachId = GetCoachId();
            var set = await _service.AddNextAsync(coachId, kind);
            return CreatedAtAction(nameof(GetAll), new { id = set.SupplementSetId }, set);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("UNIQUE") == true)
        {
            return Conflict(new { message = "Ce set existe déjà." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding next supplement set");
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    [HttpPut("{id}/items")]
    public async Task<ActionResult<SupplementSetResponse>> UpdateItems(
        int id,
        [FromBody] UpdateSupplementSetItemsRequest request)
    {
        try
        {
            var coachId = GetCoachId();
            var set = await _service.UpdateItemsAsync(coachId, id, request.Items ?? new List<SupplementSetItemDto>());
            if (set == null) return NotFound();
            return Ok(set);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating supplement set items {Id}", id);
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var coachId = GetCoachId();
            var ok = await _service.DeleteAsync(coachId, id);
            if (!ok) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting supplement set {Id}", id);
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    private int GetCoachId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(raw, out var coachId))
            throw new UnauthorizedAccessException("Invalid coach token");
        return coachId;
    }
}
