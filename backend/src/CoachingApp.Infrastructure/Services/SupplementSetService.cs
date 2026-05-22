using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class SupplementSetService
{
    private readonly CoachingDbContext _context;

    private static readonly HashSet<string> StandardUnits = new(StringComparer.Ordinal)
    {
        "g", "mg", "mcg", "ml", "UI", "caps", "tabs", "scoop", "sachet"
    };

    private const int CustomUnitMaxLength = 8;

    public SupplementSetService(CoachingDbContext context)
    {
        _context = context;
    }

    public async Task<List<SupplementSetResponse>> GetAllAsync(int coachId)
    {
        await EnsureDefaultsAsync(coachId);

        var sets = await _context.SupplementSets
            .Include(s => s.Groups)
                .ThenInclude(g => g.Items)
            .Where(s => s.CoachId == coachId)
            .OrderBy(s => s.OrderIndex)
            .ToListAsync();

        return sets.Select(MapToResponse).ToList();
    }

    public async Task<SupplementSetResponse> AddNextAsync(int coachId, string kind)
    {
        var (preTiming, postTiming) = ResolveTimings(kind);

        var existing = await _context.SupplementSets
            .Where(s => s.CoachId == coachId && (s.Timing == preTiming || s.Timing == postTiming))
            .ToListAsync();

        var (nextTiming, nextIndex) = ComputeNext(existing, preTiming, postTiming);

        var maxOrder = await _context.SupplementSets
            .Where(s => s.CoachId == coachId)
            .Select(s => (int?)s.OrderIndex)
            .MaxAsync() ?? -1;

        var set = new SupplementSet
        {
            CoachId = coachId,
            Timing = nextTiming,
            Index = nextIndex,
            OrderIndex = maxOrder + 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.SupplementSets.Add(set);
        await _context.SaveChangesAsync();

        return MapToResponse(set);
    }

    public async Task<bool> DeleteAsync(int coachId, int setId)
    {
        var set = await _context.SupplementSets
            .FirstOrDefaultAsync(s => s.SupplementSetId == setId && s.CoachId == coachId);

        if (set == null) return false;

        _context.SupplementSets.Remove(set);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<SupplementSetResponse?> AddGroupAsync(int coachId, int setId, string name)
    {
        var set = await _context.SupplementSets
            .Include(s => s.Groups)
                .ThenInclude(g => g.Items)
            .FirstOrDefaultAsync(s => s.SupplementSetId == setId && s.CoachId == coachId);

        if (set == null) return null;

        var trimmedName = (name ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(trimmedName))
            throw new ArgumentException("Le nom du groupe est requis");

        var maxOrder = set.Groups.Any() ? set.Groups.Max(g => g.OrderIndex) : -1;

        set.Groups.Add(new SupplementGroup
        {
            Name = trimmedName,
            OrderIndex = maxOrder + 1
        });
        set.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(set);
    }

    public async Task<SupplementSetResponse?> RenameGroupAsync(int coachId, int setId, int groupId, string name)
    {
        var set = await _context.SupplementSets
            .Include(s => s.Groups)
                .ThenInclude(g => g.Items)
            .FirstOrDefaultAsync(s => s.SupplementSetId == setId && s.CoachId == coachId);

        if (set == null) return null;

        var group = set.Groups.FirstOrDefault(g => g.SupplementGroupId == groupId);
        if (group == null) return null;

        var trimmedName = (name ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(trimmedName))
            throw new ArgumentException("Le nom du groupe est requis");

        group.Name = trimmedName;
        set.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(set);
    }

    public async Task<bool> DeleteGroupAsync(int coachId, int setId, int groupId)
    {
        var set = await _context.SupplementSets
            .Include(s => s.Groups)
            .FirstOrDefaultAsync(s => s.SupplementSetId == setId && s.CoachId == coachId);

        if (set == null) return false;

        var group = set.Groups.FirstOrDefault(g => g.SupplementGroupId == groupId);
        if (group == null) return false;

        _context.SupplementGroups.Remove(group);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<SupplementSetResponse?> UpdateGroupItemsAsync(int coachId, int setId, int groupId, List<SupplementSetItemDto> items)
    {
        var set = await _context.SupplementSets
            .Include(s => s.Groups)
                .ThenInclude(g => g.Items)
            .FirstOrDefaultAsync(s => s.SupplementSetId == setId && s.CoachId == coachId);

        if (set == null) return null;

        var group = set.Groups.FirstOrDefault(g => g.SupplementGroupId == groupId);
        if (group == null) return null;

        ValidateItems(items);

        group.Items.Clear();
        foreach (var dto in items.OrderBy(i => i.OrderIndex))
        {
            group.Items.Add(new SupplementSetItem
            {
                Name = dto.Name.Trim(),
                Quantity = dto.Quantity,
                Unit = NormalizeUnit(dto.Unit),
                OrderIndex = dto.OrderIndex
            });
        }
        set.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(set);
    }

    private async Task EnsureDefaultsAsync(int coachId)
    {
        var hasAny = await _context.SupplementSets.AnyAsync(s => s.CoachId == coachId);
        if (hasAny) return;

        var defaults = new List<SupplementSet>();
        var orderIndex = 0;

        for (var i = 1; i <= 3; i++)
        {
            defaults.Add(NewDefaultSet(coachId, SupplementTiming.PreMeal, i, orderIndex++));
            defaults.Add(NewDefaultSet(coachId, SupplementTiming.PostMeal, i, orderIndex++));
        }

        for (var i = 1; i <= 2; i++)
        {
            defaults.Add(NewDefaultSet(coachId, SupplementTiming.PreWorkout, i, orderIndex++));
            defaults.Add(NewDefaultSet(coachId, SupplementTiming.PostWorkout, i, orderIndex++));
        }

        _context.SupplementSets.AddRange(defaults);
        await _context.SaveChangesAsync();
    }

    private static SupplementSet NewDefaultSet(int coachId, SupplementTiming timing, int index, int orderIndex)
    {
        var now = DateTime.UtcNow;
        return new SupplementSet
        {
            CoachId = coachId,
            Timing = timing,
            Index = index,
            OrderIndex = orderIndex,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    private static (SupplementTiming Pre, SupplementTiming Post) ResolveTimings(string kind)
    {
        return kind?.ToLowerInvariant() switch
        {
            "meal" => (SupplementTiming.PreMeal, SupplementTiming.PostMeal),
            "workout" => (SupplementTiming.PreWorkout, SupplementTiming.PostWorkout),
            _ => throw new ArgumentException("kind must be 'Meal' or 'Workout'", nameof(kind))
        };
    }

    private static (SupplementTiming Timing, int Index) ComputeNext(
        List<SupplementSet> existing,
        SupplementTiming preTiming,
        SupplementTiming postTiming)
    {
        var preIndices = existing.Where(s => s.Timing == preTiming).Select(s => s.Index).ToHashSet();
        var postIndices = existing.Where(s => s.Timing == postTiming).Select(s => s.Index).ToHashSet();

        for (var i = 1; i <= 99; i++)
        {
            if (!preIndices.Contains(i)) return (preTiming, i);
            if (!postIndices.Contains(i)) return (postTiming, i);
        }

        throw new InvalidOperationException("Maximum number of supplement sets reached.");
    }

    private static void ValidateItems(List<SupplementSetItemDto> items)
    {
        if (items == null) throw new ArgumentException("Items required");

        foreach (var item in items)
        {
            if (string.IsNullOrWhiteSpace(item.Name))
                throw new ArgumentException("Item name is required");
            if (item.Quantity < 0)
                throw new ArgumentException("Quantity must be positive");

            var unit = (item.Unit ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(unit))
                throw new ArgumentException("Unit is required");
            if (!StandardUnits.Contains(unit) && unit.Length > CustomUnitMaxLength)
                throw new ArgumentException($"Custom unit must be {CustomUnitMaxLength} characters or fewer");
        }
    }

    private static string NormalizeUnit(string? unit)
    {
        var trimmed = (unit ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(trimmed)) return "g";
        return trimmed;
    }

    private static SupplementSetResponse MapToResponse(SupplementSet set)
    {
        return new SupplementSetResponse(
            set.SupplementSetId,
            set.Timing,
            set.Index,
            set.OrderIndex,
            set.Groups
                .OrderBy(g => g.OrderIndex)
                .Select(g => new SupplementGroupDto(
                    g.SupplementGroupId,
                    g.Name,
                    g.OrderIndex,
                    g.Items
                        .OrderBy(i => i.OrderIndex)
                        .Select(i => new SupplementSetItemDto(
                            i.SupplementSetItemId,
                            i.Name,
                            i.Quantity,
                            i.Unit,
                            i.OrderIndex
                        ))
                        .ToList()
                ))
                .ToList(),
            set.CreatedAt,
            set.UpdatedAt
        );
    }
}
