using CoachingApp.Core.DTOs;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoachingApp.API.Controllers;

[Authorize(Roles = "Coach")]
[ApiController]
[Route("api/meals/tabs")]
public class MealTabsController : ControllerBase
{
    private readonly MealTabService _mealTabService;

    public MealTabsController(MealTabService mealTabService)
    {
        _mealTabService = mealTabService;
    }

    [HttpGet]
    public async Task<ActionResult<List<MealTabResponse>>> GetMealTabs()
    {
        var coachId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tabs = await _mealTabService.GetMealTabsAsync(coachId);
        return Ok(tabs);
    }

    [HttpPost]
    public async Task<ActionResult<MealTabResponse>> CreateMealTab([FromBody] CreateMealTabRequest request)
    {
        var coachId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var tab = await _mealTabService.CreateMealTabAsync(coachId, request);
        return CreatedAtAction(nameof(GetMealTabs), new { id = tab.MealTabId }, tab);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMealTab(int id)
    {
        var coachId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mealTabService.DeleteMealTabAsync(id, coachId);
        
        if (!result)
            return NotFound();

        return NoContent();
    }
}
