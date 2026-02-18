namespace CoachingApp.Core.Entities;

public class MealTab
{
    public int MealTabId { get; set; }
    public int CoachId { get; set; }
    public string Name { get; set; } = string.Empty; // "1st", "2nd", "3rd", etc.
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Coach Coach { get; set; } = null!;
    public ICollection<Meal> Meals { get; set; } = new List<Meal>();
}
