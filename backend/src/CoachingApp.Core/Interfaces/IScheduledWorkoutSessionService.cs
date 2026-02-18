using CoachingApp.Core.DTOs;

namespace CoachingApp.Core.Interfaces
{
    public interface IScheduledWorkoutSessionService
    {
        Task<List<ScheduledWorkoutSessionResponse>> GetScheduledSessionsByAdherentAsync(int adherentId);
        Task<List<ScheduledWorkoutSessionResponse>> GetScheduledSessionsByCoachAsync(int coachId, DateTime? startDate = null, DateTime? endDate = null);
        Task<ScheduledWorkoutSessionResponse?> GetScheduledSessionByIdAsync(int scheduledWorkoutSessionId);
        Task<ScheduledWorkoutSessionResponse> CreateScheduledSessionAsync(CreateScheduledWorkoutRequest request);
        Task<List<ScheduledWorkoutSessionResponse>> BulkScheduleSessionsAsync(BulkScheduleRequest request);
        Task<ScheduledWorkoutSessionResponse> UpdateScheduledSessionAsync(int scheduledWorkoutSessionId, UpdateScheduledWorkoutRequest request);
        Task<bool> DeleteScheduledSessionAsync(int scheduledWorkoutSessionId);
    }
}
