using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CoachingApp.Infrastructure.Services
{
    public class WorkoutSessionService
    {
        private readonly IWorkoutSessionRepository _repository;
        private readonly WorkoutImageAssignmentService? _imageAssignmentService;
        private readonly string _uploadsPath;

        public WorkoutSessionService(
            IWorkoutSessionRepository repository,
            WorkoutImageAssignmentService? imageAssignmentService = null)
        {
            _repository = repository;
            _imageAssignmentService = imageAssignmentService;

            var baseDirectory = Directory.GetCurrentDirectory();
            _uploadsPath = Path.Combine(baseDirectory, "uploads", "workout-sessions");

            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        public async Task<IEnumerable<WorkoutSessionResponse>> GetWorkoutSessionsAsync(int coachId, string? category = null)
        {
            var sessions = await _repository.GetWorkoutSessionsByCoachIdAsync(coachId, category);
            return sessions.Select(MapToResponse);
        }

        public async Task<WorkoutSessionResponse?> GetWorkoutSessionByIdAsync(int workoutSessionId)
        {
            var session = await _repository.GetWorkoutSessionByIdAsync(workoutSessionId);
            return session != null ? MapToResponse(session) : null;
        }

        public async Task<WorkoutSessionResponse> CreateWorkoutSessionAsync(
            int coachId,
            CreateWorkoutSessionRequest request,
            IFormFile? voiceFile,
            IFormFile? imageFile)
        {
            var session = new WorkoutSession
            {
                CoachId = coachId,
                Name = request.Name,
                Description = request.Description,
                Category = request.Category,
                Status = request.Status,
                Duration = request.Duration,  // Set duration from request
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };

            // Handle voice message upload
            if (voiceFile != null && voiceFile.Length > 0)
            {
                var voiceInfo = await SaveVoiceFileAsync(coachId, voiceFile);
                session.VoiceMessageUrl = voiceInfo.Url;
                session.VoiceMessageFileName = voiceInfo.FileName;
            }

            // Handle cover image upload
            if (imageFile != null && imageFile.Length > 0)
            {
                var imageInfo = await SaveImageFileAsync(coachId, imageFile);
                session.CoverImageUrl = imageInfo.Url;
                session.CoverImageFileName = imageInfo.FileName;
            }

            // Add exercises
            foreach (var exerciseRequest in request.Exercises)
            {
                session.Exercises.Add(new WorkoutSessionExercise
                {
                    ExerciseTemplateId = exerciseRequest.ExerciseTemplateId,
                    OrderIndex = exerciseRequest.OrderIndex,
                    Sets = exerciseRequest.Sets,
                    Reps = exerciseRequest.Reps,
                    RestSeconds = exerciseRequest.RestSeconds,
                    Notes = exerciseRequest.Notes
                });
            }

            var createdSession = await _repository.AddWorkoutSessionAsync(session);
            
            // Auto-assign cover image if not manually provided
            if (string.IsNullOrEmpty(createdSession.CoverImageUrl) && _imageAssignmentService != null)
            {
                // Reload session with exercise templates for image assignment
                var sessionWithTemplates = await _repository.GetWorkoutSessionByIdAsync(createdSession.WorkoutSessionId);
                if (sessionWithTemplates != null)
                {
                    var autoImageUrl = await _imageAssignmentService.AssignCoverImageAsync(sessionWithTemplates);
                    if (!string.IsNullOrEmpty(autoImageUrl))
                    {
                        createdSession.CoverImageUrl = autoImageUrl;
                        await _repository.UpdateWorkoutSessionAsync(createdSession);
                    }
                }
            }
            
            return MapToResponse(createdSession);
        }

        public async Task<WorkoutSessionResponse> UpdateWorkoutSessionAsync(
            int workoutSessionId,
            UpdateWorkoutSessionRequest request,
            IFormFile? voiceFile,
            IFormFile? imageFile)
        {
            var session = await _repository.GetWorkoutSessionByIdAsync(workoutSessionId);
            if (session == null)
            {
                throw new KeyNotFoundException($"Workout session with ID {workoutSessionId} not found");
            }

            session.Name = request.Name;
            session.Description = request.Description;
            session.Category = request.Category;
            session.Status = request.Status;
            session.Duration = request.Duration;  // Update duration from request
            session.StartDate = request.StartDate;
            session.EndDate = request.EndDate;

            // Handle voice message upload
            if (voiceFile != null && voiceFile.Length > 0)
            {
                if (!string.IsNullOrEmpty(session.VoiceMessageFileName))
                {
                    DeleteFile(session.VoiceMessageFileName);
                }
                var voiceInfo = await SaveVoiceFileAsync(session.CoachId, voiceFile);
                session.VoiceMessageUrl = voiceInfo.Url;
                session.VoiceMessageFileName = voiceInfo.FileName;
            }

            // Handle cover image upload
            if (imageFile != null && imageFile.Length > 0)
            {
                if (!string.IsNullOrEmpty(session.CoverImageFileName))
                {
                    DeleteFile(session.CoverImageFileName);
                }
                var imageInfo = await SaveImageFileAsync(session.CoachId, imageFile);
                session.CoverImageUrl = imageInfo.Url;
                session.CoverImageFileName = imageInfo.FileName;
            }

            // Update exercises - remove old ones and add new ones
            session.Exercises.Clear();
            foreach (var exerciseRequest in request.Exercises)
            {
                session.Exercises.Add(new WorkoutSessionExercise
                {
                    ExerciseTemplateId = exerciseRequest.ExerciseTemplateId,
                    OrderIndex = exerciseRequest.OrderIndex,
                    Sets = exerciseRequest.Sets,
                    Reps = exerciseRequest.Reps,
                    RestSeconds = exerciseRequest.RestSeconds,
                    Notes = exerciseRequest.Notes
                });
            }

            await _repository.UpdateWorkoutSessionAsync(session);
            
            // Auto-assign cover image if not manually provided
            if (string.IsNullOrEmpty(session.CoverImageUrl) && _imageAssignmentService != null)
            {
                // Reload session with exercise templates for image assignment
                var sessionWithTemplates = await _repository.GetWorkoutSessionByIdAsync(session.WorkoutSessionId);
                if (sessionWithTemplates != null)
                {
                    var autoImageUrl = await _imageAssignmentService.AssignCoverImageAsync(sessionWithTemplates);
                    if (!string.IsNullOrEmpty(autoImageUrl))
                    {
                        session.CoverImageUrl = autoImageUrl;
                        await _repository.UpdateWorkoutSessionAsync(session);
                    }
                }
            }
            
            return MapToResponse(session);
        }

        public async Task DeleteWorkoutSessionAsync(int workoutSessionId)
        {
            var session = await _repository.GetWorkoutSessionByIdAsync(workoutSessionId);
            if (session != null)
            {
                if (!string.IsNullOrEmpty(session.VoiceMessageFileName))
                {
                    DeleteFile(session.VoiceMessageFileName);
                }
                if (!string.IsNullOrEmpty(session.CoverImageFileName))
                {
                    DeleteFile(session.CoverImageFileName);
                }
            }

            await _repository.DeleteWorkoutSessionAsync(workoutSessionId);
        }

        private async Task<(string Url, string FileName)> SaveVoiceFileAsync(int coachId, IFormFile voiceFile)
        {
            var coachDirectory = Path.Combine(_uploadsPath, $"coach_{coachId}", "voice");
            if (!Directory.Exists(coachDirectory))
            {
                Directory.CreateDirectory(coachDirectory);
            }

            var fileExtension = Path.GetExtension(voiceFile.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(coachDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await voiceFile.CopyToAsync(stream);
            }

            var url = $"/uploads/workout-sessions/coach_{coachId}/voice/{fileName}";
            return (url, fileName);
        }

        private async Task<(string Url, string FileName)> SaveImageFileAsync(int coachId, IFormFile imageFile)
        {
            var coachDirectory = Path.Combine(_uploadsPath, $"coach_{coachId}", "images");
            if (!Directory.Exists(coachDirectory))
            {
                Directory.CreateDirectory(coachDirectory);
            }

            var fileExtension = Path.GetExtension(imageFile.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(coachDirectory, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            var url = $"/uploads/workout-sessions/coach_{coachId}/images/{fileName}";
            return (url, fileName);
        }

        private void DeleteFile(string fileName)
        {
            try
            {
                var files = Directory.GetFiles(_uploadsPath, fileName, SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    File.Delete(file);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting file: {ex.Message}");
            }
        }

        private WorkoutSessionResponse MapToResponse(WorkoutSession session)
        {
            return new WorkoutSessionResponse
            {
                WorkoutSessionId = session.WorkoutSessionId,
                Name = session.Name,
                Description = session.Description,
                VoiceMessageUrl = session.VoiceMessageUrl,
                CoverImageUrl = session.CoverImageUrl,
                Category = session.Category,
                Status = session.Status,
                StartDate = session.StartDate,
                EndDate = session.EndDate,
                ExerciseCount = session.Exercises.Count,
                Duration = session.Duration,  // Map duration field
                Exercises = session.Exercises
                    .OrderBy(e => e.OrderIndex)
                    .Select(e => new WorkoutSessionExerciseDto
                    {
                        WorkoutSessionExerciseId = e.WorkoutSessionExerciseId,
                        ExerciseTemplateId = e.ExerciseTemplateId,
                        ExerciseName = e.ExerciseTemplate?.Name ?? "",
                        ExerciseCategory = e.ExerciseTemplate?.Category,
                        ExerciseVideoUrl = e.ExerciseTemplate?.VideoUrl,
                        ExerciseThumbnailUrl = e.ExerciseTemplate?.ThumbnailUrl,
                        OrderIndex = e.OrderIndex,
                        Sets = e.Sets,
                        Reps = e.Reps,
                        RestSeconds = e.RestSeconds,
                        Notes = e.Notes
                    })
                    .ToList(),
                AssignedClients = session.AssignedClients
                    .Select(ac => new AssignedClientResponse
                    {
                        AdherentId = ac.AdherentId,
                        Name = ac.Adherent?.Name ?? "",
                        Email = ac.Adherent?.Email ?? "",
                        PhoneNumber = ac.Adherent?.PhoneNumber,
                        ProfilePicture = ac.Adherent?.ProfilePicture,
                        Age = ac.Adherent?.DateOfBirth != null 
                            ? DateTime.UtcNow.Year - ac.Adherent.DateOfBirth.Value.Year 
                            : null,
                        Goal = null // Will be populated from CoachClient relationship if needed
                    })
                    .ToList(),
                CreatedAt = session.CreatedAt,
                UpdatedAt = session.UpdatedAt
            };
        }

        // Client Assignment Methods
        public async Task<List<AssignedClientResponse>> GetAssignedClientsAsync(int workoutSessionId)
        {
            var session = await _repository.GetWorkoutSessionByIdAsync(workoutSessionId);
            if (session == null)
            {
                throw new KeyNotFoundException($"Workout session with ID {workoutSessionId} not found");
            }

            return session.AssignedClients
                .Select(ac => new AssignedClientResponse
                {
                    AdherentId = ac.AdherentId,
                    Name = ac.Adherent?.Name ?? "",
                    Email = ac.Adherent?.Email ?? "",
                    PhoneNumber = ac.Adherent?.PhoneNumber,
                    ProfilePicture = ac.Adherent?.ProfilePicture,
                    Age = ac.Adherent?.DateOfBirth != null 
                        ? DateTime.UtcNow.Year - ac.Adherent.DateOfBirth.Value.Year 
                        : null,
                    Goal = null
                })
                .ToList();
        }

        public async Task<bool> AssignClientsAsync(int workoutSessionId, List<int> adherentIds)
        {
            var session = await _repository.GetWorkoutSessionByIdAsync(workoutSessionId);
            if (session == null)
            {
                throw new KeyNotFoundException($"Workout session with ID {workoutSessionId} not found");
            }

            // Get currently assigned client IDs
            var currentlyAssignedIds = session.AssignedClients.Select(ac => ac.AdherentId).ToHashSet();

            // Add new assignments (skip duplicates)
            foreach (var adherentId in adherentIds)
            {
                if (!currentlyAssignedIds.Contains(adherentId))
                {
                    session.AssignedClients.Add(new WorkoutSessionClient
                    {
                        WorkoutSessionId = workoutSessionId,
                        AdherentId = adherentId,
                        AssignedAt = DateTime.UtcNow
                    });
                }
            }

            await _repository.UpdateWorkoutSessionAsync(session);
            return true;
        }

        public async Task<bool> UnassignClientAsync(int workoutSessionId, int adherentId)
        {
            var session = await _repository.GetWorkoutSessionByIdAsync(workoutSessionId);
            if (session == null)
            {
                throw new KeyNotFoundException($"Workout session with ID {workoutSessionId} not found");
            }

            var assignment = session.AssignedClients.FirstOrDefault(ac => ac.AdherentId == adherentId);
            if (assignment != null)
            {
                session.AssignedClients.Remove(assignment);
                await _repository.UpdateWorkoutSessionAsync(session);
                return true;
            }

            return false;
        }
    }
}
