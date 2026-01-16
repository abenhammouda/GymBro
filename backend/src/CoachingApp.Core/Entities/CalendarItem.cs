using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class CalendarItem
{
    public int CalendarItemId { get; set; }
    public int CoachClientId { get; set; }
    public CalendarItemType ItemType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCompleted { get; set; }

    // Navigation properties
    public CoachClient CoachClient { get; set; } = null!;
}
