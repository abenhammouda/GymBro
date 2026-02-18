using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class MealTabService
{
    private readonly CoachingDbContext _context;

    public MealTabService(CoachingDbContext context)
    {
        _context = context;
    }

    public async Task<List<MealTabResponse>> GetMealTabsAsync(int coachId)
    {
        return await _context.MealTabs
            .Where(mt => mt.CoachId == coachId)
            .OrderBy(mt => mt.OrderIndex)
            .Select(mt => new MealTabResponse(
                mt.MealTabId,
                mt.Name,
                mt.OrderIndex,
                mt.Meals.Count,
                mt.CreatedAt,
                mt.UpdatedAt
            ))
            .ToListAsync();
    }

    public async Task<MealTabResponse> CreateMealTabAsync(int coachId, CreateMealTabRequest request)
    {
        var mealTab = new MealTab
        {
            CoachId = coachId,
            Name = request.Name,
            OrderIndex = request.OrderIndex,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.MealTabs.Add(mealTab);
        await _context.SaveChangesAsync();

        return new MealTabResponse(
            mealTab.MealTabId,
            mealTab.Name,
            mealTab.OrderIndex,
            0,
            mealTab.CreatedAt,
            mealTab.UpdatedAt
        );
    }

    public async Task<bool> DeleteMealTabAsync(int tabId, int coachId)
    {
        var mealTab = await _context.MealTabs
            .FirstOrDefaultAsync(mt => mt.MealTabId == tabId && mt.CoachId == coachId);

        if (mealTab == null)
            return false;

        _context.MealTabs.Remove(mealTab);
        await _context.SaveChangesAsync();
        return true;
    }
}
