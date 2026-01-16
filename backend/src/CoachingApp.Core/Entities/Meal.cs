using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class Meal
{
    public int MealId { get; set; }
    public int MealPlanId { get; set; }
    public MealType MealType { get; set; }
    public TimeSpan? MealTime { get; set; }
    public string? Description { get; set; }
    public int? Calories { get; set; }
    public bool IsCompleted { get; set; }
    public int OrderIndex { get; set; }

    // Navigation properties
    public MealPlan MealPlan { get; set; } = null!;
}
