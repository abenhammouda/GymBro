namespace CoachingApp.Core.Entities
{
    public class MealOverride
    {
        public int MealOverrideId { get; set; }
        public int ScheduledMealId { get; set; }
        public int? ReplacementMealId { get; set; }
        // "FreeMeal" | "Replace" | "Skip"
        public string ActionType { get; set; } = "FreeMeal";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ScheduledMeal ScheduledMeal { get; set; } = null!;
        public Meal? ReplacementMeal { get; set; }
    }
}
