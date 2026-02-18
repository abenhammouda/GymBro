namespace CoachingApp.Core.Entities
{
    public class ScheduledMeal
    {
        public int ScheduledMealId { get; set; }
        public int MealId { get; set; }
        public int AdherentId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public TimeSpan? ScheduledTime { get; set; }
        public string Status { get; set; } = "scheduled"; // scheduled, completed, cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Meal Meal { get; set; } = null!;
        public Adherent Adherent { get; set; } = null!;
    }
}
