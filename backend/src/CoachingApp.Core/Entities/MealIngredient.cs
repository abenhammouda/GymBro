namespace CoachingApp.Core.Entities;

public class MealIngredient
{
    public int MealIngredientId { get; set; }
    public int MealId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal QuantityGrams { get; set; }
    public int OrderIndex { get; set; }

    // Navigation properties
    public Meal Meal { get; set; } = null!;
}
