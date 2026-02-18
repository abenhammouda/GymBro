using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services
{
    public class ScheduledWorkoutSessionService : IScheduledWorkoutSessionService
    {
        private readonly CoachingDbContext _context;

        public ScheduledWorkoutSessionService(CoachingDbContext context)
        {
            _context = context;
        }

        public async Task<List<ScheduledWorkoutSessionResponse>> GetScheduledSessionsByAdherentAsync(int adherentId)
        {
            var sessions = await _context.ScheduledWorkoutSessions
                .Include(s => s.WorkoutSession)
                    .ThenInclude(ws => ws.Exercises)
                        .ThenInclude(e => e.ExerciseTemplate)
                .Include(s => s.Adherent)
                .Where(s => s.AdherentId == adherentId)
                .OrderBy(s => s.ScheduledDate)
                .ThenBy(s => s.ScheduledTime)
                .ToListAsync();

            return sessions.Select(MapToResponse).ToList();
        }

        public async Task<List<ScheduledWorkoutSessionResponse>> GetScheduledSessionsByCoachAsync(int coachId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.ScheduledWorkoutSessions
                .Include(s => s.WorkoutSession)
                    .ThenInclude(ws => ws.Exercises)
                        .ThenInclude(e => e.ExerciseTemplate)
                .Include(s => s.Adherent)
                .Where(s => s.WorkoutSession.CoachId == coachId);

            if (startDate.HasValue)
            {
                query = query.Where(s => s.ScheduledDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(s => s.ScheduledDate <= endDate.Value);
            }

            var sessions = await query
                .OrderBy(s => s.ScheduledDate)
                .ThenBy(s => s.ScheduledTime)
                .ToListAsync();

            return sessions.Select(MapToResponse).ToList();
        }

        public async Task<ScheduledWorkoutSessionResponse?> GetScheduledSessionByIdAsync(int scheduledWorkoutSessionId)
        {
            var session = await _context.ScheduledWorkoutSessions
                .Include(s => s.WorkoutSession)
                    .ThenInclude(ws => ws.Exercises)
                        .ThenInclude(e => e.ExerciseTemplate)
                .Include(s => s.Adherent)
                .FirstOrDefaultAsync(s => s.ScheduledWorkoutSessionId == scheduledWorkoutSessionId);

            return session != null ? MapToResponse(session) : null;
        }

        public async Task<ScheduledWorkoutSessionResponse> CreateScheduledSessionAsync(CreateScheduledWorkoutRequest request)
        {
            var scheduledSession = new ScheduledWorkoutSession
            {
                WorkoutSessionId = request.WorkoutSessionId,
                AdherentId = request.AdherentId,
                ScheduledDate = request.ScheduledDate.Date,
                ScheduledTime = !string.IsNullOrEmpty(request.ScheduledTime) 
                    ? TimeSpan.Parse(request.ScheduledTime) 
                    : null,
                Status = "scheduled",
                CreatedAt = DateTime.UtcNow
            };

            _context.ScheduledWorkoutSessions.Add(scheduledSession);
            await _context.SaveChangesAsync();

            return (await GetScheduledSessionByIdAsync(scheduledSession.ScheduledWorkoutSessionId))!;
        }

        public async Task<List<ScheduledWorkoutSessionResponse>> BulkScheduleSessionsAsync(BulkScheduleRequest request)
        {
            var workoutSession = await _context.WorkoutSessions
                .FirstOrDefaultAsync(ws => ws.WorkoutSessionId == request.WorkoutSessionId);

            if (workoutSession == null)
            {
                throw new KeyNotFoundException($"Workout session with ID {request.WorkoutSessionId} not found");
            }

            var scheduledSessions = new List<ScheduledWorkoutSession>();
            var currentDate = request.StartDate.Date;
            int sessionsThisDay = 0;
            int totalScheduled = 0;

            // Schedule sessions: max 2 per day, starting Monday morning
            while (totalScheduled < request.SessionsPerWeek)
            {
                // Skip weekends if needed (optional logic)
                if (currentDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    var timeSlot = sessionsThisDay == 0 ? new TimeSpan(9, 0, 0) : new TimeSpan(14, 0, 0);

                    scheduledSessions.Add(new ScheduledWorkoutSession
                    {
                        WorkoutSessionId = request.WorkoutSessionId,
                        AdherentId = request.AdherentId,
                        ScheduledDate = currentDate,
                        ScheduledTime = timeSlot,
                        Status = "scheduled",
                        CreatedAt = DateTime.UtcNow
                    });

                    totalScheduled++;
                    sessionsThisDay++;

                    // Move to next day if we've scheduled 2 sessions today
                    if (sessionsThisDay >= 2)
                    {
                        currentDate = currentDate.AddDays(1);
                        sessionsThisDay = 0;
                    }
                }
                else
                {
                    currentDate = currentDate.AddDays(1);
                }
            }

            _context.ScheduledWorkoutSessions.AddRange(scheduledSessions);
            await _context.SaveChangesAsync();

            return await GetScheduledSessionsByAdherentAsync(request.AdherentId);
        }

        public async Task<ScheduledWorkoutSessionResponse> UpdateScheduledSessionAsync(int scheduledWorkoutSessionId, UpdateScheduledWorkoutRequest request)
        {
            var session = await _context.ScheduledWorkoutSessions
                .FirstOrDefaultAsync(s => s.ScheduledWorkoutSessionId == scheduledWorkoutSessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"Scheduled session with ID {scheduledWorkoutSessionId} not found");
            }

            session.ScheduledDate = request.ScheduledDate.Date;
            session.ScheduledTime = !string.IsNullOrEmpty(request.ScheduledTime) 
                ? TimeSpan.Parse(request.ScheduledTime) 
                : null;
            
            if (!string.IsNullOrEmpty(request.Status))
            {
                session.Status = request.Status;
            }

            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return (await GetScheduledSessionByIdAsync(scheduledWorkoutSessionId))!;
        }

        public async Task<bool> DeleteScheduledSessionAsync(int scheduledWorkoutSessionId)
        {
            var session = await _context.ScheduledWorkoutSessions
                .FirstOrDefaultAsync(s => s.ScheduledWorkoutSessionId == scheduledWorkoutSessionId);

            if (session == null)
            {
                return false;
            }

            _context.ScheduledWorkoutSessions.Remove(session);
            await _context.SaveChangesAsync();

            return true;
        }

        private ScheduledWorkoutSessionResponse MapToResponse(ScheduledWorkoutSession session)
        {
            return new ScheduledWorkoutSessionResponse
            {
                ScheduledWorkoutSessionId = session.ScheduledWorkoutSessionId,
                WorkoutSessionId = session.WorkoutSessionId,
                AdherentId = session.AdherentId,
                ScheduledDate = session.ScheduledDate,
                ScheduledTime = session.ScheduledTime?.ToString(@"hh\:mm"),
                Status = session.Status,
                CreatedAt = session.CreatedAt,
                WorkoutSession = session.WorkoutSession != null ? new WorkoutSessionResponse
                {
                    WorkoutSessionId = session.WorkoutSession.WorkoutSessionId,
                    Name = session.WorkoutSession.Name,
                    Description = session.WorkoutSession.Description,
                    Category = session.WorkoutSession.Category,
                    Status = session.WorkoutSession.Status,
                    Duration = session.WorkoutSession.Duration,
                    CoverImageUrl = session.WorkoutSession.CoverImageUrl,
                    ExerciseCount = session.WorkoutSession.Exercises?.Count ?? 0,
                    CreatedAt = session.WorkoutSession.CreatedAt
                } : null,
                Adherent = session.Adherent != null ? new AdherentBasicInfo
                {
                    AdherentId = session.Adherent.AdherentId,
                    Name = session.Adherent.Name,
                    Email = session.Adherent.Email,
                    PhoneNumber = session.Adherent.PhoneNumber,
                    ProfilePicture = session.Adherent.ProfilePicture,
                    Age = session.Adherent.DateOfBirth.HasValue 
                        ? DateTime.UtcNow.Year - session.Adherent.DateOfBirth.Value.Year 
                        : null
                } : null
            };
        }
    }
}
