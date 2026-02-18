using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoachingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MuscleGroupImagesController : ControllerBase
{
    private readonly MuscleGroupImageService _service;
    private readonly ILogger<MuscleGroupImagesController> _logger;

    public MuscleGroupImagesController(
        MuscleGroupImageService service,
        ILogger<MuscleGroupImagesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpPost("fetch")]
    public async Task<IActionResult> FetchImages()
    {
        try
        {
            await _service.FetchAndStoreImagesAsync();
            return Ok(new { message = "Images fetched and stored successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching muscle group images");
            return StatusCode(500, "An error occurred while fetching images");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllImages()
    {
        try
        {
            var images = await _service.GetAllImagesAsync();
            return Ok(images);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving muscle group images");
            return StatusCode(500, "An error occurred while retrieving images");
        }
    }

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetImagesByCategory(string category)
    {
        try
        {
            var images = await _service.GetImagesByCategoryAsync(category);
            return Ok(images);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving images for category {Category}", category);
            return StatusCode(500, "An error occurred while retrieving images");
        }
    }
}
