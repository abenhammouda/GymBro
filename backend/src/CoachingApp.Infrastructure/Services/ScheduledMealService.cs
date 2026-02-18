using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services
{
    public class ScheduledMealService : IScheduledMealService
    {
        private readonly CoachingDbContext _context;

        public ScheduledMealService(CoachingDbContext context)
        {
            _context = context;
        }

        public async Task<List<ScheduledMealResponse>> GetScheduledMealsByAdherentAsync(int adherentId)
        {
            var meals = await _context.ScheduledMeals
                .Include(sm => sm.Meal)
                    .ThenInclude(m => m.Ingredients)
                .Include(sm => sm.Adherent)
                .Where(sm => sm.AdherentId == adherentId)
                .OrderBy(sm => sm.ScheduledDate)
                .ThenBy(sm => sm.ScheduledTime)
                .ToListAsync();

            return meals.Select(MapToResponse).ToList();
        }

        public async Task<List<ScheduledMealResponse>> GetScheduledMealsByCoachAsync(int coachId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.ScheduledMeals
                .Include(sm => sm.Meal)
                    .ThenInclude(m => m.Ingredients)
                .Include(sm => sm.Meal.MealTab)
                .Include(sm => sm.Adherent)
                .Where(sm => sm.Meal.MealTab.CoachId == coachId);

            if (startDate.HasValue)
            {
                query = query.Where(sm => sm.ScheduledDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(sm => sm.ScheduledDate <= endDate.Value);
            }

            var meals = await query
                .OrderBy(sm => sm.ScheduledDate)
                .ThenBy(sm => sm.ScheduledTime)
                .ToListAsync();

            return meals.Select(MapToResponse).ToList();
        }

        public async Task<ScheduledMealResponse?> GetScheduledMealByIdAsync(int scheduledMealId)
        {
            var meal = await _context.ScheduledMeals
                .Include(sm => sm.Meal)
                    .ThenInclude(m => m.Ingredients)
                .Include(sm => sm.Adherent)
                .FirstOrDefaultAsync(sm => sm.ScheduledMealId == scheduledMealId);

            return meal != null ? MapToResponse(meal) : null;
        }

        public async Task<ScheduledMealResponse> CreateScheduledMealAsync(CreateScheduledMealRequest request)
        {
            var scheduledMeal = new ScheduledMeal
            {
                MealId = request.MealId,
                AdherentId = request.AdherentId,
                ScheduledDate = request.ScheduledDate.Date,
                ScheduledTime = !string.IsNullOrEmpty(request.ScheduledTime) 
                    ? TimeSpan.Parse(request.ScheduledTime) 
                    : null,
                Status = "scheduled",
                CreatedAt = DateTime.UtcNow
            };

            _context.ScheduledMeals.Add(scheduledMeal);
            await _context.SaveChangesAsync();

            return (await GetScheduledMealByIdAsync(scheduledMeal.ScheduledMealId))!;
        }

        public async Task<ScheduledMealResponse> UpdateScheduledMealAsync(int scheduledMealId, UpdateScheduledMealRequest request)
        {
            var meal = await _context.ScheduledMeals
                .FirstOrDefaultAsync(sm => sm.ScheduledMealId == scheduledMealId);

            if (meal == null)
            {
                throw new KeyNotFoundException($"Scheduled meal with ID {scheduledMealId} not found");
            }

            meal.ScheduledDate = request.ScheduledDate.Date;
            meal.ScheduledTime = !string.IsNullOrEmpty(request.ScheduledTime) 
                ? TimeSpan.Parse(request.ScheduledTime) 
                : null;
            
            if (!string.IsNullOrEmpty(request.Status))
            {
                meal.Status = request.Status;
            }

            meal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return (await GetScheduledMealByIdAsync(scheduledMealId))!;
        }

        public async Task<bool> DeleteScheduledMealAsync(int scheduledMealId)
        {
            var meal = await _context.ScheduledMeals
                .FirstOrDefaultAsync(sm => sm.ScheduledMealId == scheduledMealId);

            if (meal == null)
            {
                return false;
            }

            _context.ScheduledMeals.Remove(meal);
            await _context.SaveChangesAsync();

            return true;
        }

        private ScheduledMealResponse MapToResponse(ScheduledMeal meal)
        {
            return new ScheduledMealResponse
            {
                ScheduledMealId = meal.ScheduledMealId,
                MealId = meal.MealId,
                AdherentId = meal.AdherentId,
                ScheduledDate = meal.ScheduledDate,
                ScheduledTime = meal.ScheduledTime?.ToString(@"hh\:mm"),
                Status = meal.Status,
                CreatedAt = meal.CreatedAt,
                Meal = meal.Meal != null ? new MealResponse(
                    MealId: meal.Meal.MealId,
                    MealTabId: meal.Meal.MealTabId,
                    Name: meal.Meal.Name,
                    Description: meal.Meal.Description,
                    ImageUrl: meal.Meal.ImageUrl,
                    OrderIndex: meal.Meal.OrderIndex,
                    Ingredients: meal.Meal.Ingredients?.Select(i => new MealIngredientDto(
                        Name: i.Name,
                        QuantityGrams: i.QuantityGrams,
                        Type: i.Type,
                        OrderIndex: i.OrderIndex
                    )).ToList() ?? new List<MealIngredientDto>(),
                    CreatedAt: meal.Meal.CreatedAt,
                    UpdatedAt: meal.Meal.UpdatedAt
                ) : null,
                Adherent = meal.Adherent != null ? new AdherentBasicInfo
                {
                    AdherentId = meal.Adherent.AdherentId,
                    Name = meal.Adherent.Name,
                    Email = meal.Adherent.Email,
                    PhoneNumber = meal.Adherent.PhoneNumber,
                    ProfilePicture = meal.Adherent.ProfilePicture,
                    Age = meal.Adherent.DateOfBirth.HasValue 
                        ? DateTime.UtcNow.Year - meal.Adherent.DateOfBirth.Value.Year 
                        : null
                } : null
            };
        }
    }
}
