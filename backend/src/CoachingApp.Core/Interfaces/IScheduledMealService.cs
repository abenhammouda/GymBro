using CoachingApp.Core.DTOs;

namespace CoachingApp.Core.Interfaces
{
    public interface IScheduledMealService
    {
        Task<List<ScheduledMealResponse>> GetScheduledMealsByAdherentAsync(int adherentId);
        Task<List<ScheduledMealResponse>> GetScheduledMealsByCoachAsync(int coachId, DateTime? startDate = null, DateTime? endDate = null);
        Task<ScheduledMealResponse?> GetScheduledMealByIdAsync(int scheduledMealId);
        Task<ScheduledMealResponse> CreateScheduledMealAsync(CreateScheduledMealRequest request);
        Task<ScheduledMealResponse> UpdateScheduledMealAsync(int scheduledMealId, UpdateScheduledMealRequest request);
        Task<bool> DeleteScheduledMealAsync(int scheduledMealId);
    }
}
