using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class SupplementSet
{
    public int SupplementSetId { get; set; }
    public int CoachId { get; set; }
    public SupplementTiming Timing { get; set; }
    public int Index { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Coach Coach { get; set; } = null!;
    public ICollection<SupplementSetItem> Items { get; set; } = new List<SupplementSetItem>();
}
