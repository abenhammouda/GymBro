using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class MealService
{
    private readonly CoachingDbContext _context;
    private readonly NutritionCalculatorService _nutrition;
    private readonly string _uploadsPath;

    public MealService(CoachingDbContext context, NutritionCalculatorService nutrition)
    {
        _context = context;
        _nutrition = nutrition;

        var baseDirectory = Directory.GetCurrentDirectory();
        _uploadsPath = Path.Combine(baseDirectory, "uploads", "meals");

        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
        }
    }

    public async Task<List<MealResponse>> GetMealsByTabAsync(int tabId)
    {
        var meals = await _context.Meals
            .Include(m => m.Ingredients)
            .Where(m => m.MealTabId == tabId)
            .OrderBy(m => m.OrderIndex)
            .ToListAsync();

        return meals.Select(MapToResponse).ToList();
    }

    public async Task<MealResponse> CreateMealAsync(CreateMealRequest request, IFormFile? imageFile)
    {
        var meal = new Meal
        {
            MealTabId = request.MealTabId,
            Name = request.Name,
            Description = request.Description,
            OrderIndex = request.OrderIndex,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (imageFile != null)
        {
            var fileExtension = Path.GetExtension(imageFile.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            meal.ImageFileName = fileName;
            meal.ImageUrl = $"/uploads/meals/{fileName}";
        }

        foreach (var ingredientDto in request.Ingredients)
        {
            meal.Ingredients.Add(new MealIngredient
            {
                Name = ingredientDto.Name,
                QuantityGrams = ingredientDto.QuantityGrams,
                OrderIndex = ingredientDto.OrderIndex
            });
        }

        if (request.CalculateMacrosWithAI)
        {
            await ComputeMacrosForIngredientsAsync(meal.Ingredients);
        }

        _context.Meals.Add(meal);
        await _context.SaveChangesAsync();

        return MapToResponse(meal);
    }

    public async Task<MealResponse?> UpdateMealAsync(int mealId, UpdateMealRequest request, IFormFile? imageFile)
    {
        var meal = await _context.Meals
            .Include(m => m.Ingredients)
            .FirstOrDefaultAsync(m => m.MealId == mealId);

        if (meal == null)
            return null;

        meal.Name = request.Name;
        meal.Description = request.Description;
        meal.UpdatedAt = DateTime.UtcNow;

        if (imageFile != null)
        {
            if (!string.IsNullOrEmpty(meal.ImageFileName))
            {
                var oldImagePath = Path.Combine(_uploadsPath, meal.ImageFileName);
                if (File.Exists(oldImagePath))
                    File.Delete(oldImagePath);
            }

            var fileExtension = Path.GetExtension(imageFile.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            meal.ImageFileName = fileName;
            meal.ImageUrl = $"/uploads/meals/{fileName}";
        }

        // Preserve manually-entered macros across edits: index existing ingredients
        // by (name lowercase + qty) and carry over macros if the user resubmits the same row.
        var manualByKey = meal.Ingredients
            .Where(i => i.MacroSource == MacroSource.Manual)
            .ToDictionary(i => IngredientKey(i.Name, i.QuantityGrams), i => i);

        meal.Ingredients.Clear();
        foreach (var ingredientDto in request.Ingredients)
        {
            var ing = new MealIngredient
            {
                Name = ingredientDto.Name,
                QuantityGrams = ingredientDto.QuantityGrams,
                OrderIndex = ingredientDto.OrderIndex
            };
            var key = IngredientKey(ing.Name, ing.QuantityGrams);
            if (manualByKey.TryGetValue(key, out var prev))
            {
                ing.Calories = prev.Calories;
                ing.Proteins = prev.Proteins;
                ing.Carbs = prev.Carbs;
                ing.Fats = prev.Fats;
                ing.MacroSource = MacroSource.Manual;
            }
            meal.Ingredients.Add(ing);
        }

        await _context.SaveChangesAsync();

        return MapToResponse(meal);
    }

    public async Task<bool> DeleteMealAsync(int mealId)
    {
        var meal = await _context.Meals.FindAsync(mealId);
        if (meal == null)
            return false;

        if (!string.IsNullOrEmpty(meal.ImageFileName))
        {
            var imagePath = Path.Combine(_uploadsPath, meal.ImageFileName);
            if (File.Exists(imagePath))
                File.Delete(imagePath);
        }

        _context.Meals.Remove(meal);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Computes macros (via AI + nutrition DB) for every ingredient that doesn't already
    /// have macros set by the user (Manual source is preserved).
    /// </summary>
    public async Task<MealResponse?> CalculateMacrosAsync(int mealId, CancellationToken ct = default)
    {
        var meal = await _context.Meals
            .Include(m => m.Ingredients)
            .FirstOrDefaultAsync(m => m.MealId == mealId, ct);

        if (meal == null) return null;

        await ComputeMacrosForIngredientsAsync(meal.Ingredients, ct);
        meal.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return MapToResponse(meal);
    }

    /// <summary>
    /// Manual macro entry for one ingredient (used when AI failed to match the food).
    /// </summary>
    public async Task<MealResponse?> SetIngredientMacrosAsync(int mealId, int ingredientId, ManualMacrosDto dto, CancellationToken ct = default)
    {
        var meal = await _context.Meals
            .Include(m => m.Ingredients)
            .FirstOrDefaultAsync(m => m.MealId == mealId, ct);

        if (meal == null) return null;

        var ing = meal.Ingredients.FirstOrDefault(i => i.MealIngredientId == ingredientId);
        if (ing == null) return null;

        ing.Calories = dto.Calories;
        ing.Proteins = dto.Proteins;
        ing.Carbs = dto.Carbs;
        ing.Fats = dto.Fats;
        ing.MacroSource = MacroSource.Manual;
        ing.MacroCalculationFailed = false;
        meal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return MapToResponse(meal);
    }

    private async Task ComputeMacrosForIngredientsAsync(
        IEnumerable<MealIngredient> ingredients,
        CancellationToken ct = default)
    {
        foreach (var ing in ingredients)
        {
            // Don't overwrite manual entries
            if (ing.MacroSource == MacroSource.Manual && ing.Calories != null) continue;

            var result = await _nutrition.CalculateAsync(ing.Name, ing.QuantityGrams, ct);
            if (result.Failed)
            {
                ing.MacroCalculationFailed = true;
                ing.Calories = null;
                ing.Proteins = null;
                ing.Carbs = null;
                ing.Fats = null;
                ing.NutritionFoodId = null;
                ing.MacroSource = null;
            }
            else
            {
                ing.MacroCalculationFailed = false;
                ing.Calories = result.Calories;
                ing.Proteins = result.Proteins;
                ing.Carbs = result.Carbs;
                ing.Fats = result.Fats;
                ing.NutritionFoodId = result.NutritionFoodId;
                ing.MacroSource = MacroSource.AI;
            }
        }
    }

    private static string IngredientKey(string name, decimal qty) =>
        $"{name.Trim().ToLowerInvariant()}|{qty}";

    private MealResponse MapToResponse(Meal meal)
    {
        var ingredients = meal.Ingredients
            .OrderBy(i => i.OrderIndex)
            .ToList();

        var hasMacrosOnAll = ingredients.Count > 0 && ingredients.All(i => i.Calories != null);
        decimal? totalCalories = hasMacrosOnAll ? ingredients.Sum(i => i.Calories!.Value) : null;
        decimal? totalProteins = hasMacrosOnAll ? ingredients.Sum(i => i.Proteins ?? 0) : null;
        decimal? totalCarbs = hasMacrosOnAll ? ingredients.Sum(i => i.Carbs ?? 0) : null;
        decimal? totalFats = hasMacrosOnAll ? ingredients.Sum(i => i.Fats ?? 0) : null;
        bool hasFailed = ingredients.Any(i => i.MacroCalculationFailed);

        return new MealResponse(
            meal.MealId,
            meal.MealTabId,
            meal.Name,
            meal.Description,
            meal.ImageUrl,
            meal.OrderIndex,
            ingredients.Select(i => new MealIngredientDto(
                i.MealIngredientId,
                i.Name,
                i.QuantityGrams,
                i.OrderIndex,
                i.Calories,
                i.Proteins,
                i.Carbs,
                i.Fats,
                i.MacroSource?.ToString(),
                i.MacroCalculationFailed
            )).ToList(),
            totalCalories,
            totalProteins,
            totalCarbs,
            totalFats,
            hasFailed,
            meal.CreatedAt,
            meal.UpdatedAt
        );
    }
}
