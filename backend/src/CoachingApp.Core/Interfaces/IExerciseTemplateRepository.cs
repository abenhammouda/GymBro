using CoachingApp.Core.Entities;

namespace CoachingApp.Core.Interfaces
{
    public interface IExerciseTemplateRepository
    {
        Task<IEnumerable<ExerciseTemplate>> GetExerciseTemplatesByCoachIdAsync(int coachId, string? category = null);
        Task<ExerciseTemplate?> GetExerciseTemplateByIdAsync(int exerciseTemplateId);
        Task<ExerciseTemplate> AddExerciseTemplateAsync(ExerciseTemplate exerciseTemplate);
        Task UpdateExerciseTemplateAsync(ExerciseTemplate exerciseTemplate);
        Task DeleteExerciseTemplateAsync(int exerciseTemplateId);
    }
}
