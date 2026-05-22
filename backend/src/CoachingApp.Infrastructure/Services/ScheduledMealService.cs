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
                .Include(sm => sm.Override)
                    .ThenInclude(o => o!.ReplacementMeal)
                        .ThenInclude(rm => rm!.Ingredients)
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
                .Include(sm => sm.Override)
                    .ThenInclude(o => o!.ReplacementMeal)
                        .ThenInclude(rm => rm!.Ingredients)
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
                .Include(sm => sm.Override)
                    .ThenInclude(o => o!.ReplacementMeal)
                        .ThenInclude(rm => rm!.Ingredients)
                .FirstOrDefaultAsync(sm => sm.ScheduledMealId == scheduledMealId);

            return meal != null ? MapToResponse(meal) : null;
        }

        public async Task<MealOverrideInfo> CreateOverrideAsync(int scheduledMealId, CreateMealOverrideRequest request)
        {
            var existing = await _context.MealOverrides
                .FirstOrDefaultAsync(o => o.ScheduledMealId == scheduledMealId);
            if (existing != null)
                _context.MealOverrides.Remove(existing);

            var override_ = new CoachingApp.Core.Entities.MealOverride
            {
                ScheduledMealId = scheduledMealId,
                ActionType = request.ActionType,
                ReplacementMealId = request.ReplacementMealId,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };
            _context.MealOverrides.Add(override_);
            await _context.SaveChangesAsync();

            await _context.Entry(override_).Reference(o => o.ReplacementMeal).LoadAsync();
            if (override_.ReplacementMeal != null)
                await _context.Entry(override_.ReplacementMeal).Collection(m => m.Ingredients).LoadAsync();

            return MapOverride(override_);
        }

        public async Task<bool> DeleteOverrideAsync(int scheduledMealId)
        {
            var override_ = await _context.MealOverrides
                .FirstOrDefaultAsync(o => o.ScheduledMealId == scheduledMealId);
            if (override_ == null) return false;
            _context.MealOverrides.Remove(override_);
            await _context.SaveChangesAsync();
            return true;
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
                .Include(sm => sm.Override)
                .FirstOrDefaultAsync(sm => sm.ScheduledMealId == scheduledMealId);

            if (meal == null)
                return false;

            if (meal.Override != null)
                _context.MealOverrides.Remove(meal.Override);

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
                Meal = meal.Meal != null ? BuildMealResponse(meal.Meal) : null,
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
                } : null,
                Override = meal.Override != null ? MapOverride(meal.Override) : null
            };
        }

        private static MealOverrideInfo MapOverride(CoachingApp.Core.Entities.MealOverride o) =>
            new MealOverrideInfo
            {
                MealOverrideId = o.MealOverrideId,
                ActionType = o.ActionType,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                ReplacementMeal = o.ReplacementMeal != null ? BuildMealResponse(o.ReplacementMeal) : null
            };

        private static MealResponse BuildMealResponse(CoachingApp.Core.Entities.Meal m)
        {
            var ingredients = (m.Ingredients ?? new List<CoachingApp.Core.Entities.MealIngredient>())
                .OrderBy(i => i.OrderIndex)
                .ToList();
            var hasAll = ingredients.Count > 0 && ingredients.All(i => i.Calories != null);
            decimal? totalCalories = hasAll ? ingredients.Sum(i => i.Calories!.Value) : (decimal?)null;
            decimal? totalProteins = hasAll ? ingredients.Sum(i => i.Proteins ?? 0) : (decimal?)null;
            decimal? totalCarbs = hasAll ? ingredients.Sum(i => i.Carbs ?? 0) : (decimal?)null;
            decimal? totalFats = hasAll ? ingredients.Sum(i => i.Fats ?? 0) : (decimal?)null;
            bool hasFailed = ingredients.Any(i => i.MacroCalculationFailed);

            return new MealResponse(
                MealId: m.MealId,
                MealTabId: m.MealTabId,
                Name: m.Name,
                Description: m.Description,
                ImageUrl: m.ImageUrl,
                OrderIndex: m.OrderIndex,
                Ingredients: ingredients.Select(i => new MealIngredientDto(
                    MealIngredientId: i.MealIngredientId,
                    Name: i.Name,
                    QuantityGrams: i.QuantityGrams,
                    OrderIndex: i.OrderIndex,
                    Calories: i.Calories,
                    Proteins: i.Proteins,
                    Carbs: i.Carbs,
                    Fats: i.Fats,
                    MacroSource: i.MacroSource?.ToString(),
                    MacroCalculationFailed: i.MacroCalculationFailed
                )).ToList(),
                TotalCalories: totalCalories,
                TotalProteins: totalProteins,
                TotalCarbs: totalCarbs,
                TotalFats: totalFats,
                HasFailedIngredients: hasFailed,
                CreatedAt: m.CreatedAt,
                UpdatedAt: m.UpdatedAt
            );
        }
    }
}
