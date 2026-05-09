using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class MacroPlanService
{
    private readonly CoachingDbContext _context;

    public MacroPlanService(CoachingDbContext context)
    {
        _context = context;
    }

    /// <summary>Retourne le plan de macros actuellement actif (EndDate == null).</summary>
    public async Task<MacroPlanDto?> GetCurrentMacroPlanAsync(int coachClientId)
    {
        var plan = await _context.MacroPlans
            .Where(mp => mp.CoachClientId == coachClientId && mp.EndDate == null)
            .OrderByDescending(mp => mp.StartDate)
            .FirstOrDefaultAsync();

        return plan == null ? null : MapToDto(plan);
    }

    /// <summary>Historique de tous les plans de macros d'un adhérent.</summary>
    public async Task<List<MacroPlanDto>> GetMacroPlanHistoryAsync(int coachClientId)
    {
        var plans = await _context.MacroPlans
            .Where(mp => mp.CoachClientId == coachClientId)
            .OrderByDescending(mp => mp.StartDate)
            .ToListAsync();

        return plans.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Crée un nouveau plan de macros. Clôture automatiquement le plan actif précédent.
    /// </summary>
    public async Task<MacroPlanDto> CreateMacroPlanAsync(CreateMacroPlanRequest request)
    {
        // Clôturer le plan actif courant
        var activePlan = await _context.MacroPlans
            .Where(mp => mp.CoachClientId == request.CoachClientId && mp.EndDate == null)
            .FirstOrDefaultAsync();

        if (activePlan != null)
            activePlan.EndDate = DateTime.UtcNow;

        var newPlan = new MacroPlan
        {
            CoachClientId = request.CoachClientId,
            Calories = request.Calories,
            ProteinGrams = request.ProteinGrams,
            CarbsGrams = request.CarbsGrams,
            FatGrams = request.FatGrams,
            Notes = request.Notes,
            StartDate = DateTime.UtcNow,
            EndDate = null,
            CreatedAt = DateTime.UtcNow
        };

        _context.MacroPlans.Add(newPlan);
        await _context.SaveChangesAsync();

        return MapToDto(newPlan);
    }

    private static MacroPlanDto MapToDto(MacroPlan mp) => new()
    {
        MacroPlanId = mp.MacroPlanId,
        CoachClientId = mp.CoachClientId,
        Calories = mp.Calories,
        ProteinGrams = mp.ProteinGrams,
        CarbsGrams = mp.CarbsGrams,
        FatGrams = mp.FatGrams,
        StartDate = mp.StartDate,
        EndDate = mp.EndDate,
        Notes = mp.Notes,
        CreatedAt = mp.CreatedAt
    };
}
