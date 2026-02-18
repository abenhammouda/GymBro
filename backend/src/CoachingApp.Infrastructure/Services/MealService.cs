using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class MealService
{
    private readonly CoachingDbContext _context;
    private readonly string _uploadsPath;

    public MealService(CoachingDbContext context)
    {
        _context = context;
        
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

        // Handle image upload if provided
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

        // Add ingredients
        foreach (var ingredientDto in request.Ingredients)
        {
            meal.Ingredients.Add(new MealIngredient
            {
                Name = ingredientDto.Name,
                QuantityGrams = ingredientDto.QuantityGrams,
                Type = ingredientDto.Type,
                OrderIndex = ingredientDto.OrderIndex
            });
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

        // Handle image upload if provided
        if (imageFile != null)
        {
            // Delete old image if exists
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

        // Replace ingredients
        meal.Ingredients.Clear();
        foreach (var ingredientDto in request.Ingredients)
        {
            meal.Ingredients.Add(new MealIngredient
            {
                Name = ingredientDto.Name,
                QuantityGrams = ingredientDto.QuantityGrams,
                Type = ingredientDto.Type,
                OrderIndex = ingredientDto.OrderIndex
            });
        }

        await _context.SaveChangesAsync();

        return MapToResponse(meal);
    }

    public async Task<bool> DeleteMealAsync(int mealId)
    {
        var meal = await _context.Meals.FindAsync(mealId);
        if (meal == null)
            return false;

        // Delete image file if exists
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

    private MealResponse MapToResponse(Meal meal)
    {
        return new MealResponse(
            meal.MealId,
            meal.MealTabId,
            meal.Name,
            meal.Description,
            meal.ImageUrl,
            meal.OrderIndex,
            meal.Ingredients
                .OrderBy(i => i.OrderIndex)
                .Select(i => new MealIngredientDto(
                    i.Name,
                    i.QuantityGrams,
                    i.Type,
                    i.OrderIndex
                ))
                .ToList(),
            meal.CreatedAt,
            meal.UpdatedAt
        );
    }
}
