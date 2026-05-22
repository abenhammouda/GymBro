namespace CoachingApp.Core.Entities;

public class FoodAliasCache
{
    public int FoodAliasCacheId { get; set; }
    public string NormalizedInput { get; set; } = string.Empty;
    public int? NutritionFoodId { get; set; }
    public NutritionFood? NutritionFood { get; set; }
    public DateTime CreatedAt { get; set; }
}
