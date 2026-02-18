using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Repositories
{
    public class WorkoutSessionRepository : IWorkoutSessionRepository
    {
        private readonly CoachingDbContext _context;

        public WorkoutSessionRepository(CoachingDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WorkoutSession>> GetWorkoutSessionsByCoachIdAsync(int coachId, string? category = null)
        {
            var query = _context.WorkoutSessions
                .Include(ws => ws.Exercises)
                    .ThenInclude(wse => wse.ExerciseTemplate)
                .Include(ws => ws.AssignedClients)
                .Where(ws => ws.CoachId == coachId);

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(ws => ws.Category == category);
            }

            return await query
                .OrderByDescending(ws => ws.CreatedAt)
                .ToListAsync();
        }

        public async Task<WorkoutSession?> GetWorkoutSessionByIdAsync(int workoutSessionId)
        {
            return await _context.WorkoutSessions
                .Include(ws => ws.Exercises)
                    .ThenInclude(wse => wse.ExerciseTemplate)
                .Include(ws => ws.AssignedClients)
                    .ThenInclude(ac => ac.Adherent)
                .FirstOrDefaultAsync(ws => ws.WorkoutSessionId == workoutSessionId);
        }

        public async Task<WorkoutSession> AddWorkoutSessionAsync(WorkoutSession workoutSession)
        {
            _context.WorkoutSessions.Add(workoutSession);
            await _context.SaveChangesAsync();
            return workoutSession;
        }

        public async Task UpdateWorkoutSessionAsync(WorkoutSession workoutSession)
        {
            workoutSession.UpdatedAt = DateTime.UtcNow;
            _context.WorkoutSessions.Update(workoutSession);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteWorkoutSessionAsync(int workoutSessionId)
        {
            var workoutSession = await _context.WorkoutSessions
                .Include(ws => ws.Exercises)
                .FirstOrDefaultAsync(ws => ws.WorkoutSessionId == workoutSessionId);

            if (workoutSession != null)
            {
                _context.WorkoutSessions.Remove(workoutSession);
                await _context.SaveChangesAsync();
            }
        }
    }
}
