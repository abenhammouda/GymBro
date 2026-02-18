using CoachingApp.Core.Entities;

namespace CoachingApp.Core.Interfaces
{
    public interface IWorkoutSessionRepository
    {
        Task<IEnumerable<WorkoutSession>> GetWorkoutSessionsByCoachIdAsync(int coachId, string? category = null);
        Task<WorkoutSession?> GetWorkoutSessionByIdAsync(int workoutSessionId);
        Task<WorkoutSession> AddWorkoutSessionAsync(WorkoutSession workoutSession);
        Task UpdateWorkoutSessionAsync(WorkoutSession workoutSession);
        Task DeleteWorkoutSessionAsync(int workoutSessionId);
    }
}
