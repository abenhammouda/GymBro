using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace CoachingApp.API.Controllers;

[Authorize(Roles = "Coach")]
[ApiController]
[Route("api/meals")]
public class MealsController : ControllerBase
{
    private readonly MealService _mealService;

    public MealsController(MealService mealService)
    {
        _mealService = mealService;
    }

    [HttpGet]
    public async Task<ActionResult<List<MealResponse>>> GetMeals([FromQuery] int tabId)
    {
        var meals = await _mealService.GetMealsByTabAsync(tabId);
        return Ok(meals);
    }

    [HttpPost]
    public async Task<ActionResult<MealResponse>> CreateMeal(
        [FromForm] string mealData,
        [FromForm] IFormFile? imageFile)
    {
        try
        {
            var request = JsonSerializer.Deserialize<CreateMealRequest>(mealData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null)
                return BadRequest("Invalid meal data");

            var meal = await _mealService.CreateMealAsync(request, imageFile);
            return CreatedAtAction(nameof(GetMeals), new { tabId = meal.MealTabId }, meal);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MealResponse>> UpdateMeal(
        int id,
        [FromForm] string mealData,
        [FromForm] IFormFile? imageFile)
    {
        try
        {
            var request = JsonSerializer.Deserialize<UpdateMealRequest>(mealData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (request == null)
                return BadRequest("Invalid meal data");

            var meal = await _mealService.UpdateMealAsync(id, request, imageFile);
            
            if (meal == null)
                return NotFound();

            return Ok(meal);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeal(int id)
    {
        var result = await _mealService.DeleteMealAsync(id);
        
        if (!result)
            return NotFound();

        return NoContent();
    }
}
