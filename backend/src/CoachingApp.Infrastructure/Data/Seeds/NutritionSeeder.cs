using System.Text.Json;
using CoachingApp.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Data.Seeds;

/// <summary>
/// Seeds the NutritionFood table from a curated CIQUAL-style JSON file
/// shipped with the assembly. Idempotent: only runs when the table is empty.
/// </summary>
public class NutritionSeeder
{
    private readonly CoachingDbContext _db;
    private readonly ILogger<NutritionSeeder> _logger;

    public NutritionSeeder(CoachingDbContext db, ILogger<NutritionSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    private record SeedEntry(string en, string fr, decimal kcal, decimal p, decimal c, decimal f);

    public async Task SeedIfEmptyAsync(CancellationToken ct = default)
    {
        // Clear stale negative caches created before the Gemini macro fallback was added.
        var negativeCount = await _db.FoodAliasCaches
            .Where(c => c.NutritionFoodId == null)
            .ExecuteDeleteAsync(ct);
        if (negativeCount > 0)
            _logger.LogInformation("Cleared {Count} stale negative food alias cache entries.", negativeCount);

        if (await _db.NutritionFoods.AnyAsync(ct))
        {
            _logger.LogDebug("NutritionFoods already seeded — skipping.");
            return;
        }

        var path = Path.Combine(AppContext.BaseDirectory, "Data", "Seeds", "ciqual_seed.json");
        if (!File.Exists(path))
        {
            _logger.LogWarning("CIQUAL seed file not found at {Path} — table left empty.", path);
            return;
        }

        var json = await File.ReadAllTextAsync(path, ct);
        var entries = JsonSerializer.Deserialize<List<SeedEntry>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (entries == null || entries.Count == 0)
        {
            _logger.LogWarning("CIQUAL seed file at {Path} contains no entries.", path);
            return;
        }

        foreach (var e in entries)
        {
            _db.NutritionFoods.Add(new NutritionFood
            {
                CanonicalName = e.en,
                CanonicalNameFr = e.fr,
                CaloriesPer100g = e.kcal,
                ProteinsPer100g = e.p,
                CarbsPer100g = e.c,
                FatsPer100g = e.f,
                Source = "CIQUAL"
            });
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Seeded {Count} nutrition foods.", entries.Count);
    }
}
