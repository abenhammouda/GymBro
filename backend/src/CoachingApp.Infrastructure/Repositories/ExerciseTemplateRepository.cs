using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Repositories
{
    public class ExerciseTemplateRepository : IExerciseTemplateRepository
    {
        private readonly CoachingDbContext _context;

        public ExerciseTemplateRepository(CoachingDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExerciseTemplate>> GetExerciseTemplatesByCoachIdAsync(int coachId, string? category = null)
        {
            var query = _context.ExerciseTemplates
                .Where(et => et.CoachId == coachId);

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(et => et.Category == category);
            }

            return await query
                .OrderByDescending(et => et.CreatedAt)
                .ToListAsync();
        }

        public async Task<ExerciseTemplate?> GetExerciseTemplateByIdAsync(int exerciseTemplateId)
        {
            return await _context.ExerciseTemplates
                .FirstOrDefaultAsync(et => et.ExerciseTemplateId == exerciseTemplateId);
        }

        public async Task<ExerciseTemplate> AddExerciseTemplateAsync(ExerciseTemplate exerciseTemplate)
        {
            exerciseTemplate.CreatedAt = DateTime.UtcNow;
            exerciseTemplate.UpdatedAt = DateTime.UtcNow;

            _context.ExerciseTemplates.Add(exerciseTemplate);
            await _context.SaveChangesAsync();
            return exerciseTemplate;
        }

        public async Task UpdateExerciseTemplateAsync(ExerciseTemplate exerciseTemplate)
        {
            exerciseTemplate.UpdatedAt = DateTime.UtcNow;
            _context.ExerciseTemplates.Update(exerciseTemplate);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteExerciseTemplateAsync(int exerciseTemplateId)
        {
            var exerciseTemplate = await GetExerciseTemplateByIdAsync(exerciseTemplateId);
            if (exerciseTemplate != null)
            {
                _context.ExerciseTemplates.Remove(exerciseTemplate);
                await _context.SaveChangesAsync();
            }
        }
    }
}
