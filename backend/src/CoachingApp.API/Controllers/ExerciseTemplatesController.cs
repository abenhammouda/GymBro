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
        private readonly VideoImportService _videoImportService;
        private readonly ILogger<ExerciseTemplatesController> _logger;

        public ExerciseTemplatesController(
            ExerciseTemplateService service,
            VideoImportService videoImportService,
            ILogger<ExerciseTemplatesController> logger)
        {
            _service = service;
            _videoImportService = videoImportService;
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

        // ──────────────────────────────────────────────────────
        // AI Video Import Endpoints
        // ──────────────────────────────────────────────────────

        /// <summary>
        /// Import a single video (YouTube URL or uploaded file) with AI detection.
        /// </summary>
        [HttpPost("import-video")]
        [RequestSizeLimit(600_000_000)] // 600MB max
        public async Task<ActionResult<VideoImportResult>> ImportVideo(
            [FromForm] VideoImportRequest? request,
            [FromForm] IFormFile? videoFile)
        {
            try
            {
                var coachId = GetCoachIdFromClaims();

                // Case 1: YouTube URL
                if (!string.IsNullOrWhiteSpace(request?.YoutubeUrl))
                {
                    var result = await _videoImportService.ImportFromYouTubeAsync(request.YoutubeUrl, coachId);
                    return result.IsSuccess ? Ok(result) : BadRequest(result);
                }

                // Case 2: Google Drive URL
                if (!string.IsNullOrWhiteSpace(request?.DriveUrl))
                {
                    var result = await _videoImportService.ImportFromDriveAsync(request.DriveUrl, coachId);
                    return result.IsSuccess ? Ok(result) : BadRequest(result);
                }

                // Case 3: Local file upload
                if (videoFile != null && videoFile.Length > 0)
                {
                    // Save to temp path first (read IFormFile stream exactly once)
                    var tempPath = Path.Combine(
                        Path.GetTempPath(),
                        $"gymbro_upload_{Guid.NewGuid()}{Path.GetExtension(videoFile.FileName)}");

                    await using (var fs = new FileStream(tempPath, FileMode.Create))
                        await videoFile.CopyToAsync(fs);

                    // AI detection + move file to uploads + create template (correct order)
                    var result = await _videoImportService.ImportFromLocalFilePathAsync(
                        tempFilePath: tempPath,
                        originalFileName: videoFile.FileName,
                        coachId: coachId
                    );

                    return result.IsSuccess ? Ok(result) : BadRequest(result);
                }

                return BadRequest("Provide either a YouTube URL or a video file.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing video");
                return StatusCode(500, "An error occurred during video import");
            }
        }

        /// <summary>
        /// List all videos from a YouTube channel/playlist (no download, fast).
        /// Used by the frontend to preview videos before importing.
        /// </summary>
        [HttpPost("list-channel")]
        public async Task<ActionResult<List<ChannelVideoInfo>>> ListChannelVideos([FromBody] VideoImportRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.ChannelUrl))
                    return BadRequest("ChannelUrl is required");

                var videos = await _videoImportService.ListChannelVideosAsync(request.ChannelUrl, maxVideos: 50);
                return Ok(videos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing channel videos");
                return StatusCode(500, "An error occurred while listing channel videos");
            }
        }

        private int GetCoachIdFromClaims()
        {
            var coachIdClaim = User.FindFirst("CoachId")?.Value;

            if (string.IsNullOrEmpty(coachIdClaim))
                coachIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(coachIdClaim) || !int.TryParse(coachIdClaim, out var coachId))
                throw new UnauthorizedAccessException("Coach ID not found in token");

            return coachId;
        }
    }
}
