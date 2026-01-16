namespace CoachingApp.Core.Entities;

public class MealPlan
{
    public int MealPlanId { get; set; }
    public int ProgramDayId { get; set; }
    public int CaloriesTarget { get; set; }
    public decimal? ProteinGrams { get; set; }
    public decimal? CarbsGrams { get; set; }
    public decimal? FatGrams { get; set; }
    public bool IsCompleted { get; set; }

    // Navigation properties
    public ProgramDay ProgramDay { get; set; } = null!;
    public ICollection<Meal> Meals { get; set; } = new List<Meal>();
}
