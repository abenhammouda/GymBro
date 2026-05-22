using System.Globalization;
using System.Text;
using CoachingApp.Core.Entities;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Hybrid macro resolver:
///   1. Normalize raw name (lowercase + strip accents + trim).
///   2. Hit FoodAliasCache (positive or negative cache).
///   3. Miss → call OpenAI to get canonical English/French name → fuzzy match
///      against NutritionFood (CIQUAL). Cache the result either way.
///   4. Compute macros = (per 100g) * (qtyGrams / 100).
/// </summary>
public class NutritionCalculatorService
{
    private readonly CoachingDbContext _db;
    private readonly GeminiFoodNormalizerService _normalizer;
    private readonly ILogger<NutritionCalculatorService> _logger;
    private const double MinConfidence = 0.5;

    public NutritionCalculatorService(
        CoachingDbContext db,
        GeminiFoodNormalizerService normalizer,
        ILogger<NutritionCalculatorService> logger)
    {
        _db = db;
        _normalizer = normalizer;
        _logger = logger;
    }

    public record NutritionResult(
        bool Failed,
        int? NutritionFoodId,
        decimal? Calories,
        decimal? Proteins,
        decimal? Carbs,
        decimal? Fats
    );

    public async Task<NutritionResult> CalculateAsync(string rawName, decimal quantityGrams, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(rawName) || quantityGrams <= 0)
            return new NutritionResult(true, null, null, null, null, null);

        var key = Normalize(rawName);

        // 1. Cache lookup
        var cached = await _db.FoodAliasCaches
            .Include(c => c.NutritionFood)
            .FirstOrDefaultAsync(c => c.NormalizedInput == key, ct);

        NutritionFood? food = null;
        if (cached != null)
        {
            food = cached.NutritionFood;
            if (food == null)
            {
                // Negative cache — we tried before, no match
                return new NutritionResult(true, null, null, null, null, null);
            }
        }
        else
        {
            // 2. Load all foods once — reused for direct match and AI-guided match
            var allFoods = await _db.NutritionFoods.ToListAsync(ct);

            // 3. Direct fuzzy match against DB (no API call)
            food = TryDirectFuzzyMatch(key, allFoods);
            if (food != null)
            {
                _logger.LogDebug("Direct match for '{Key}' → '{Food}' (no AI call)", key, food.CanonicalName);
            }

            bool isNegative = false;
            if (food == null)
            {
                // 4. AI call → canonical name match → Gemini macros fallback
                (food, isNegative) = await ResolveViaAiAsync(rawName, allFoods, ct);
            }

            // 5. Cache: positive always; negative only for truly unrecognized inputs
            if (food != null || isNegative)
            {
                _db.FoodAliasCaches.Add(new FoodAliasCache
                {
                    NormalizedInput = key,
                    NutritionFoodId = food?.NutritionFoodId,
                    CreatedAt = DateTime.UtcNow
                });
            }
            // Caller will SaveChanges once after processing all ingredients
        }

        if (food == null)
            return new NutritionResult(true, null, null, null, null, null);

        var factor = quantityGrams / 100m;
        return new NutritionResult(
            Failed: false,
            NutritionFoodId: food.NutritionFoodId,
            Calories: Math.Round(food.CaloriesPer100g * factor, 2),
            Proteins: Math.Round(food.ProteinsPer100g * factor, 2),
            Carbs: Math.Round(food.CarbsPer100g * factor, 2),
            Fats: Math.Round(food.FatsPer100g * factor, 2)
        );
    }

    private static NutritionFood? TryDirectFuzzyMatch(string normalizedKey, IList<NutritionFood> allFoods, double threshold = 0.5)
    {
        var candidates = new[] { normalizedKey };
        var best = allFoods
            .Select(nf => new
            {
                Food = nf,
                Score = Math.Max(
                    BestScore(Normalize(nf.CanonicalName), candidates),
                    nf.CanonicalNameFr == null ? 0 : BestScore(Normalize(nf.CanonicalNameFr), candidates))
            })
            .Where(x => x.Score >= threshold)
            .OrderByDescending(x => x.Score)
            .FirstOrDefault();
        return best?.Food;
    }

    // Returns (food, isNegative).
    // isNegative=true means the input is not a real food → caller stores a negative cache.
    // isNegative=false with food==null means we have no data but shouldn't cache negatively.
    private async Task<(NutritionFood? food, bool isNegative)> ResolveViaAiAsync(string rawName, IList<NutritionFood> allFoods, CancellationToken ct)
    {
        var ai = await _normalizer.NormalizeFoodAsync(rawName, ct);
        if (ai == null || ai.Confidence < MinConfidence) return (null, true);

        // Build candidate keywords (normalized) from both canonical names
        var candidates = new[] { ai.CanonicalFr, ai.CanonicalEn }
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(Normalize)
            .Distinct()
            .ToList();

        if (candidates.Count == 0) return (null, true);

        // Fuzzy match against loaded foods (no extra DB query)
        var best = allFoods
            .Select(nf => new
            {
                Food = nf,
                Score = Math.Max(
                    BestScore(Normalize(nf.CanonicalName), candidates),
                    nf.CanonicalNameFr == null ? 0 : BestScore(Normalize(nf.CanonicalNameFr), candidates))
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .FirstOrDefault();

        if (best != null)
            return (best.Food, false);

        // No CIQUAL match — fall back to Gemini-provided macro estimates
        if (ai.KcalPer100g != null)
        {
            _logger.LogInformation("No CIQUAL match for '{Raw}' — using Gemini macros (en='{En}' fr='{Fr}' kcal={Kcal})",
                rawName, ai.CanonicalEn, ai.CanonicalFr, ai.KcalPer100g);

            var aiFood = new NutritionFood
            {
                CanonicalName    = string.IsNullOrWhiteSpace(ai.CanonicalEn) ? rawName : ai.CanonicalEn,
                CanonicalNameFr  = string.IsNullOrWhiteSpace(ai.CanonicalFr) ? null : ai.CanonicalFr,
                CaloriesPer100g  = ai.KcalPer100g.Value,
                ProteinsPer100g  = ai.ProteinPer100g ?? 0,
                CarbsPer100g     = ai.CarbsPer100g ?? 0,
                FatsPer100g      = ai.FatPer100g ?? 0,
                Source           = "Gemini"
            };
            _db.NutritionFoods.Add(aiFood);
            await _db.SaveChangesAsync(ct);
            return (aiFood, false);
        }

        _logger.LogInformation("No CIQUAL match and no AI macros for '{Raw}' (en='{En}' fr='{Fr}' conf={Conf})",
            rawName, ai.CanonicalEn, ai.CanonicalFr, ai.Confidence);
        return (null, true);
    }

    /// <summary>
    /// Simple token-overlap score (Jaccard-ish). Returns a value in [0, 1].
    /// </summary>
    private static double BestScore(string foodName, IEnumerable<string> candidates)
    {
        var foodTokens = Tokens(foodName);
        if (foodTokens.Count == 0) return 0;

        double best = 0;
        foreach (var cand in candidates)
        {
            var candTokens = Tokens(cand);
            if (candTokens.Count == 0) continue;

            var inter = foodTokens.Intersect(candTokens).Count();
            var union = foodTokens.Union(candTokens).Count();
            double score = (double)inter / union;

            // Exact-match bonus
            if (foodName == cand) score = 1.0;

            if (score > best) best = score;
        }
        return best;
    }

    private static HashSet<string> Tokens(string s) =>
        s.Split(new[] { ' ', ',', '-', '\'', '’', '/' }, StringSplitOptions.RemoveEmptyEntries)
         .Where(t => t.Length > 1)
         .ToHashSet();

    public static string Normalize(string input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        var lower = input.Trim().ToLowerInvariant();
        var normalized = lower.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var ch in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                sb.Append(ch);
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
