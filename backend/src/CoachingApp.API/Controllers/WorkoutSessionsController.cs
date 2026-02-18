using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Services;
using CoachingApp.API.ModelBinders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace CoachingApp.API.Controllers
{
    [Authorize(Roles = "Coach")]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkoutSessionsController : ControllerBase
    {
        private readonly WorkoutSessionService _workoutSessionService;

        public WorkoutSessionsController(WorkoutSessionService workoutSessionService)
        {
            _workoutSessionService = workoutSessionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkoutSessionResponse>>> GetWorkoutSessions([FromQuery] string? category = null)
        {
            var coachId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var sessions = await _workoutSessionService.GetWorkoutSessionsAsync(coachId, category);
            return Ok(sessions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutSessionResponse>> GetWorkoutSession(int id)
        {
            var session = await _workoutSessionService.GetWorkoutSessionByIdAsync(id);
            
            if (session == null)
            {
                return NotFound();
            }
            
            return Ok(session);
        }

        [HttpPost]
        public async Task<ActionResult<WorkoutSessionResponse>> CreateWorkoutSession(
            [FromForm] string name,
            [FromForm] string category,
            [FromForm] string status,
            [FromForm] string? description,
            [FromForm] int? duration,
            [FromForm] string? startDate,
            [FromForm] string? endDate,
            [FromForm] string exercises,
            [FromForm] IFormFile? voiceFile,
            [FromForm] IFormFile? imageFile)
        {
            try
            {
                var exercisesList = JsonSerializer.Deserialize<List<CreateWorkoutSessionExerciseRequest>>(exercises, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<CreateWorkoutSessionExerciseRequest>();

                var request = new CreateWorkoutSessionRequest
                {
                    Name = name,
                    Category = category,
                    Status = status,
                    Description = description,
                    Duration = duration,
                    StartDate = string.IsNullOrEmpty(startDate) ? null : DateTime.Parse(startDate),
                    EndDate = string.IsNullOrEmpty(endDate) ? null : DateTime.Parse(endDate),
                    Exercises = exercisesList
                };

                var coachId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var session = await _workoutSessionService.CreateWorkoutSessionAsync(coachId, request, voiceFile, imageFile);
                return CreatedAtAction(nameof(GetWorkoutSession), new { id = session.WorkoutSessionId }, session);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WorkoutSessionResponse>> UpdateWorkoutSession(
            int id,
            [FromForm] string name,
            [FromForm] string category,
            [FromForm] string status,
            [FromForm] string? description,
            [FromForm] int? duration,
            [FromForm] string? startDate,
            [FromForm] string? endDate,
            [FromForm] string exercises,
            [FromForm] IFormFile? voiceFile,
            [FromForm] IFormFile? imageFile)
        {
            try
            {
                var exercisesList = JsonSerializer.Deserialize<List<CreateWorkoutSessionExerciseRequest>>(exercises, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<CreateWorkoutSessionExerciseRequest>();

                var request = new UpdateWorkoutSessionRequest
                {
                    Name = name,
                    Category = category,
                    Status = status,
                    Description = description,
                    Duration = duration,
                    StartDate = string.IsNullOrEmpty(startDate) ? null : DateTime.Parse(startDate),
                    EndDate = string.IsNullOrEmpty(endDate) ? null : DateTime.Parse(endDate),
                    Exercises = exercisesList
                };

                var session = await _workoutSessionService.UpdateWorkoutSessionAsync(id, request, voiceFile, imageFile);
                return Ok(session);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkoutSession(int id)
        {
            try
            {
                await _workoutSessionService.DeleteWorkoutSessionAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Client Assignment Endpoints
        [HttpGet("{id}/clients")]
        public async Task<ActionResult<List<AssignedClientResponse>>> GetAssignedClients(int id)
        {
            try
            {
                var clients = await _workoutSessionService.GetAssignedClientsAsync(id);
                return Ok(clients);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/clients")]
        public async Task<IActionResult> AssignClients(int id, [FromBody] AssignClientsRequest request)
        {
            try
            {
                await _workoutSessionService.AssignClientsAsync(id, request.AdherentIds);
                return Ok(new { message = "Clients assigned successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/clients/{adherentId}")]
        public async Task<IActionResult> UnassignClient(int id, int adherentId)
        {
            try
            {
                var result = await _workoutSessionService.UnassignClientAsync(id, adherentId);
                if (result)
                {
                    return Ok(new { message = "Client unassigned successfully" });
                }
                return NotFound(new { message = "Client assignment not found" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
