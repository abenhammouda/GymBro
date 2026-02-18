namespace CoachingApp.Core.Entities;

public class Meal
{
    public int MealId { get; set; }
    public int MealTabId { get; set; } // Changed from MealPlanId
    public string Name { get; set; } = string.Empty; // NEW
    public string? Description { get; set; }
    public string? ImageUrl { get; set; } // NEW
    public string? ImageFileName { get; set; } // NEW
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // NEW
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // NEW

    // Navigation properties
    public MealTab MealTab { get; set; } = null!;
    public ICollection<MealIngredient> Ingredients { get; set; } = new List<MealIngredient>();
}
