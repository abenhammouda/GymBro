namespace CoachingApp.Core.DTOs
{
    public class MealOverrideInfo
    {
        public int MealOverrideId { get; set; }
        public string ActionType { get; set; } = "FreeMeal";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public MealResponse? ReplacementMeal { get; set; }
    }

    public class CreateMealOverrideRequest
    {
        public string ActionType { get; set; } = "FreeMeal";
        public int? ReplacementMealId { get; set; }
        public string? Notes { get; set; }
    }

    public class ScheduledMealResponse
    {
        public int ScheduledMealId { get; set; }
        public int MealId { get; set; }
        public int AdherentId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; } // HH:mm format
        public string Status { get; set; } = "scheduled";
        public DateTime CreatedAt { get; set; }

        // Nested objects
        public MealResponse? Meal { get; set; }
        public AdherentBasicInfo? Adherent { get; set; }
        public MealOverrideInfo? Override { get; set; }
    }

    public class CreateScheduledMealRequest
    {
        public int MealId { get; set; }
        public int AdherentId { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; } // HH:mm format
    }

    public class UpdateScheduledMealRequest
    {
        public DateTime ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; }
        public string? Status { get; set; } // scheduled, completed, cancelled
    }
}
