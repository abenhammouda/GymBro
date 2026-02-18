using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CoachingApp.Core.DTOs;
using CoachingApp.Core.Interfaces;
using System.Security.Claims;

namespace CoachingApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ScheduledWorkoutSessionsController : ControllerBase
    {
        private readonly IScheduledWorkoutSessionService _service;

        public ScheduledWorkoutSessionsController(IScheduledWorkoutSessionService service)
        {
            _service = service;
        }

        private int GetCoachId()
        {
            var coachIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(coachIdClaim ?? "0");
        }

        [HttpGet("client/{adherentId}")]
        public async Task<ActionResult<List<ScheduledWorkoutSessionResponse>>> GetClientScheduledSessions(int adherentId)
        {
            try
            {
                var sessions = await _service.GetScheduledSessionsByAdherentAsync(adherentId);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving scheduled sessions", error = ex.Message });
            }
        }

        [HttpGet("coach")]
        public async Task<ActionResult<List<ScheduledWorkoutSessionResponse>>> GetCoachScheduledSessions(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var coachId = GetCoachId();
                var sessions = await _service.GetScheduledSessionsByCoachAsync(coachId, startDate, endDate);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving scheduled sessions", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduledWorkoutSessionResponse>> GetScheduledSession(int id)
        {
            try
            {
                var session = await _service.GetScheduledSessionByIdAsync(id);
                
                if (session == null)
                {
                    return NotFound(new { message = $"Scheduled session with ID {id} not found" });
                }

                return Ok(session);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving scheduled session", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ScheduledWorkoutSessionResponse>> CreateScheduledSession(
            [FromBody] CreateScheduledWorkoutRequest request)
        {
            try
            {
                var session = await _service.CreateScheduledSessionAsync(request);
                return CreatedAtAction(nameof(GetScheduledSession), new { id = session.ScheduledWorkoutSessionId }, session);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating scheduled session", error = ex.Message });
            }
        }

        [HttpPost("bulk-schedule")]
        public async Task<ActionResult<List<ScheduledWorkoutSessionResponse>>> BulkScheduleSessions(
            [FromBody] BulkScheduleRequest request)
        {
            try
            {
                var sessions = await _service.BulkScheduleSessionsAsync(request);
                return Ok(sessions);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error bulk scheduling sessions", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ScheduledWorkoutSessionResponse>> UpdateScheduledSession(
            int id,
            [FromBody] UpdateScheduledWorkoutRequest request)
        {
            try
            {
                var session = await _service.UpdateScheduledSessionAsync(id, request);
                return Ok(session);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating scheduled session", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteScheduledSession(int id)
        {
            try
            {
                var result = await _service.DeleteScheduledSessionAsync(id);
                
                if (!result)
                {
                    return NotFound(new { message = $"Scheduled session with ID {id} not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting scheduled session", error = ex.Message });
            }
        }
    }
}
