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
    public class ScheduledMealsController : ControllerBase
    {
        private readonly IScheduledMealService _service;

        public ScheduledMealsController(IScheduledMealService service)
        {
            _service = service;
        }

        private int GetCoachId()
        {
            var coachIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(coachIdClaim ?? "0");
        }

        [HttpGet("client/{adherentId}")]
        public async Task<ActionResult<List<ScheduledMealResponse>>> GetClientScheduledMeals(int adherentId)
        {
            try
            {
                var meals = await _service.GetScheduledMealsByAdherentAsync(adherentId);
                return Ok(meals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving scheduled meals", error = ex.Message });
            }
        }

        [HttpGet("coach")]
        public async Task<ActionResult<List<ScheduledMealResponse>>> GetCoachScheduledMeals(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var coachId = GetCoachId();
                var meals = await _service.GetScheduledMealsByCoachAsync(coachId, startDate, endDate);
                return Ok(meals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving scheduled meals", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduledMealResponse>> GetScheduledMeal(int id)
        {
            try
            {
                var meal = await _service.GetScheduledMealByIdAsync(id);
                
                if (meal == null)
                {
                    return NotFound(new { message = $"Scheduled meal with ID {id} not found" });
                }

                return Ok(meal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving scheduled meal", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ScheduledMealResponse>> CreateScheduledMeal(
            [FromBody] CreateScheduledMealRequest request)
        {
            try
            {
                var meal = await _service.CreateScheduledMealAsync(request);
                return CreatedAtAction(nameof(GetScheduledMeal), new { id = meal.ScheduledMealId }, meal);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating scheduled meal", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ScheduledMealResponse>> UpdateScheduledMeal(
            int id,
            [FromBody] UpdateScheduledMealRequest request)
        {
            try
            {
                var meal = await _service.UpdateScheduledMealAsync(id, request);
                return Ok(meal);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating scheduled meal", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteScheduledMeal(int id)
        {
            try
            {
                var result = await _service.DeleteScheduledMealAsync(id);
                
                if (!result)
                {
                    return NotFound(new { message = $"Scheduled meal with ID {id} not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting scheduled meal", error = ex.Message });
            }
        }
    }
}
