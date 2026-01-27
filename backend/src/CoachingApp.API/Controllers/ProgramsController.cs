using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoachingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgramsController : ControllerBase
{
    private readonly ProgramTemplateService _service;
    private readonly ILogger<ProgramsController> _logger;

    public ProgramsController(ProgramTemplateService service, ILogger<ProgramsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProgramResponse>>> GetPrograms([FromQuery] string? status = null)
    {
        try
        {
            var coachId = GetCoachIdFromClaims();
            var programs = await _service.GetProgramTemplatesAsync(coachId, status);
            return Ok(programs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting programs");
            return StatusCode(500, "An error occurred while retrieving programs");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProgramResponse>> GetProgram(int id)
    {
        try
        {
            var program = await _service.GetProgramTemplateByIdAsync(id);
            if (program == null)
            {
                return NotFound();
            }

            return Ok(program);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting program {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the program");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProgramResponse>> CreateProgram(
        [FromForm] CreateProgramRequest request,
        [FromForm] IFormFile? imageFile)
    {
        try
        {
            var coachId = GetCoachIdFromClaims();
            var program = await _service.CreateProgramTemplateAsync(coachId, request, imageFile);
            return CreatedAtAction(nameof(GetProgram), new { id = program.ProgramId }, program);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating program");
            return StatusCode(500, "An error occurred while creating the program");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProgramResponse>> UpdateProgram(
        int id,
        [FromForm] UpdateProgramRequest request,
        [FromForm] IFormFile? imageFile)
    {
        try
        {
            var program = await _service.UpdateProgramTemplateAsync(id, request, imageFile);
            return Ok(program);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating program {Id}", id);
            return StatusCode(500, "An error occurred while updating the program");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProgram(int id)
    {
        try
        {
            await _service.DeleteProgramTemplateAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting program {Id}", id);
            return StatusCode(500, "An error occurred while deleting the program");
        }
    }

    private int GetCoachIdFromClaims()
    {
        var coachIdClaim = User.FindFirst("CoachId")?.Value;
        
        if (string.IsNullOrEmpty(coachIdClaim))
        {
            coachIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
        
        if (string.IsNullOrEmpty(coachIdClaim) || !int.TryParse(coachIdClaim, out var coachId))
        {
            throw new UnauthorizedAccessException("Coach ID not found in token");
        }
        return coachId;
    }
}
