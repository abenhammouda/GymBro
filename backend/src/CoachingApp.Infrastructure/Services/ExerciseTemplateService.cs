using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CoachingApp.Infrastructure.Services
{
    public class ExerciseTemplateService
    {
        private readonly IExerciseTemplateRepository _repository;
        private readonly string _uploadsPath;

        public ExerciseTemplateService(IExerciseTemplateRepository repository)
        {
            _repository = repository;
            
            // Use a relative path from the current directory
            // In production, this should be configured via appsettings.json
            var baseDirectory = Directory.GetCurrentDirectory();
            _uploadsPath = Path.Combine(baseDirectory, "uploads", "exercise-videos");
            
            // Create uploads directory if it doesn't exist
            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        public async Task<IEnumerable<ExerciseTemplateResponse>> GetExerciseTemplatesAsync(int coachId, string? category = null)
        {
            var templates = await _repository.GetExerciseTemplatesByCoachIdAsync(coachId, category);
            return templates.Select(MapToResponse);
        }

        public async Task<ExerciseTemplateResponse?> GetExerciseTemplateByIdAsync(int exerciseTemplateId)
        {
            var template = await _repository.GetExerciseTemplateByIdAsync(exerciseTemplateId);
            return template != null ? MapToResponse(template) : null;
        }

        public async Task<ExerciseTemplateResponse> CreateExerciseTemplateAsync(int coachId, CreateExerciseTemplateRequest request, IFormFile? videoFile)
        {
            var template = new ExerciseTemplate
            {
                CoachId = coachId,
                Name = request.Name,
                Category = request.Category,
                Description = request.Description,
                Equipment = request.Equipment,
                Instructions = request.Instructions
            };

            // Handle video upload if provided
            if (videoFile != null && videoFile.Length > 0)
            {
                var videoInfo = await SaveVideoFileAsync(coachId, videoFile);
                template.VideoUrl = videoInfo.VideoUrl;
                template.VideoFileName = videoInfo.FileName;
                template.Duration = videoInfo.Duration;
                template.ThumbnailUrl = videoInfo.ThumbnailUrl;
            }
            // Otherwise, use the VideoUrl from the request (e.g., YouTube link)
            else if (!string.IsNullOrEmpty(request.VideoUrl))
            {
                template.VideoUrl = request.VideoUrl;
            }

            var createdTemplate = await _repository.AddExerciseTemplateAsync(template);
            return MapToResponse(createdTemplate);
        }

        public async Task<ExerciseTemplateResponse> UpdateExerciseTemplateAsync(int exerciseTemplateId, UpdateExerciseTemplateRequest request, IFormFile? videoFile)
        {
            var template = await _repository.GetExerciseTemplateByIdAsync(exerciseTemplateId);
            if (template == null)
            {
                throw new KeyNotFoundException($"Exercise template with ID {exerciseTemplateId} not found");
            }

            template.Name = request.Name;
            template.Category = request.Category;
            template.Description = request.Description;
            template.Equipment = request.Equipment;
            template.Instructions = request.Instructions;

            // Handle video upload if provided
            if (videoFile != null && videoFile.Length > 0)
            {
                // Delete old video if exists
                if (!string.IsNullOrEmpty(template.VideoFileName))
                {
                    DeleteVideoFile(template.VideoFileName);
                }

                var videoInfo = await SaveVideoFileAsync(template.CoachId, videoFile);
                template.VideoUrl = videoInfo.VideoUrl;
                template.VideoFileName = videoInfo.FileName;
                template.Duration = videoInfo.Duration;
                template.ThumbnailUrl = videoInfo.ThumbnailUrl;
            }
            // Otherwise, update the VideoUrl from the request (e.g., YouTube link)
            else if (!string.IsNullOrEmpty(request.VideoUrl))
            {
                // If switching from uploaded file to URL, clear file-related fields
                if (!string.IsNullOrEmpty(template.VideoFileName))
                {
                    DeleteVideoFile(template.VideoFileName);
                    template.VideoFileName = null;
                    template.ThumbnailUrl = null;
                }
                template.VideoUrl = request.VideoUrl;
            }

            await _repository.UpdateExerciseTemplateAsync(template);
            return MapToResponse(template);
        }

        public async Task DeleteExerciseTemplateAsync(int exerciseTemplateId)
        {
            var template = await _repository.GetExerciseTemplateByIdAsync(exerciseTemplateId);
            if (template != null && !string.IsNullOrEmpty(template.VideoFileName))
            {
                DeleteVideoFile(template.VideoFileName);
            }

            await _repository.DeleteExerciseTemplateAsync(exerciseTemplateId);
        }

        private async Task<(string VideoUrl, string FileName, int Duration, string? ThumbnailUrl)> SaveVideoFileAsync(int coachId, IFormFile videoFile)
        {
            // Create coach-specific directory
            var coachDirectory = Path.Combine(_uploadsPath, $"coach_{coachId}");
            if (!Directory.Exists(coachDirectory))
            {
                Directory.CreateDirectory(coachDirectory);
            }

            // Generate unique filename
            var fileExtension = Path.GetExtension(videoFile.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(coachDirectory, fileName);

            // Save video file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await videoFile.CopyToAsync(stream);
            }

            // Generate relative URL
            var videoUrl = $"/uploads/exercise-videos/coach_{coachId}/{fileName}";

            // TODO: Extract video duration using FFmpeg or similar
            var duration = 0; // Placeholder

            // TODO: Generate thumbnail
            string? thumbnailUrl = null;

            return (videoUrl, fileName, duration, thumbnailUrl);
        }

        private void DeleteVideoFile(string fileName)
        {
            try
            {
                // Find and delete the file
                var files = Directory.GetFiles(_uploadsPath, fileName, SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    File.Delete(file);
                }
            }
            catch (Exception ex)
            {
                // Log error but don't throw
                Console.WriteLine($"Error deleting video file: {ex.Message}");
            }
        }

        private ExerciseTemplateResponse MapToResponse(ExerciseTemplate template)
        {
            return new ExerciseTemplateResponse
            {
                ExerciseTemplateId = template.ExerciseTemplateId,
                Name = template.Name,
                Description = template.Description,
                Category = template.Category,
                Equipment = template.Equipment,
                VideoUrl = template.VideoUrl,
                ThumbnailUrl = template.ThumbnailUrl,
                Duration = template.Duration,
                Instructions = template.Instructions,
                CreatedAt = template.CreatedAt,
                UpdatedAt = template.UpdatedAt
            };
        }
    }
}
