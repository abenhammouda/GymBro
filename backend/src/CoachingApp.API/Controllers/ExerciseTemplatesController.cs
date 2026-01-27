using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoachingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExerciseTemplatesController : ControllerBase
    {
        private readonly ExerciseTemplateService _service;
        private readonly ILogger<ExerciseTemplatesController> _logger;

        public ExerciseTemplatesController(ExerciseTemplateService service, ILogger<ExerciseTemplatesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExerciseTemplateResponse>>> GetExerciseTemplates([FromQuery] string? category = null)
        {
            try
            {
                var coachId = GetCoachIdFromClaims();
                var templates = await _service.GetExerciseTemplatesAsync(coachId, category);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting exercise templates");
                return StatusCode(500, "An error occurred while retrieving exercise templates");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExerciseTemplateResponse>> GetExerciseTemplate(int id)
        {
            try
            {
                var template = await _service.GetExerciseTemplateByIdAsync(id);
                if (template == null)
                {
                    return NotFound();
                }

                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting exercise template {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the exercise template");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ExerciseTemplateResponse>> CreateExerciseTemplate(
            [FromForm] CreateExerciseTemplateRequest request,
            [FromForm] IFormFile? videoFile)
        {
            try
            {
                var coachId = GetCoachIdFromClaims();
                var template = await _service.CreateExerciseTemplateAsync(coachId, request, videoFile);
                return CreatedAtAction(nameof(GetExerciseTemplate), new { id = template.ExerciseTemplateId }, template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating exercise template");
                return StatusCode(500, "An error occurred while creating the exercise template");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ExerciseTemplateResponse>> UpdateExerciseTemplate(
            int id,
            [FromForm] UpdateExerciseTemplateRequest request,
            [FromForm] IFormFile? videoFile)
        {
            try
            {
                var template = await _service.UpdateExerciseTemplateAsync(id, request, videoFile);
                return Ok(template);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating exercise template {Id}", id);
                return StatusCode(500, "An error occurred while updating the exercise template");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExerciseTemplate(int id)
        {
            try
            {
                await _service.DeleteExerciseTemplateAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting exercise template {Id}", id);
                return StatusCode(500, "An error occurred while deleting the exercise template");
            }
        }

        private int GetCoachIdFromClaims()
        {
            // Try CoachId first (for backward compatibility)
            var coachIdClaim = User.FindFirst("CoachId")?.Value;
            
            // If not found, try NameIdentifier (standard claim)
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
}
