namespace CoachingApp.Core.Entities;

public class MealIngredient
{
    public int MealIngredientId { get; set; }
    public int MealId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal QuantityGrams { get; set; }
    public int OrderIndex { get; set; }

    // Macros (nullable: filled when calculated or entered manually)
    public decimal? Calories { get; set; }
    public decimal? Proteins { get; set; }
    public decimal? Carbs { get; set; }
    public decimal? Fats { get; set; }
    public MacroSource? MacroSource { get; set; }
    public int? NutritionFoodId { get; set; }
    public bool MacroCalculationFailed { get; set; }

    // Navigation properties
    public Meal Meal { get; set; } = null!;
    public NutritionFood? NutritionFood { get; set; }
}
