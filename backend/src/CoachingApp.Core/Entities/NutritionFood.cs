namespace CoachingApp.Core.Entities;

public class NutritionFood
{
    public int NutritionFoodId { get; set; }
    public string CanonicalName { get; set; } = string.Empty;
    public string? CanonicalNameFr { get; set; }
    public decimal CaloriesPer100g { get; set; }
    public decimal ProteinsPer100g { get; set; }
    public decimal CarbsPer100g { get; set; }
    public decimal FatsPer100g { get; set; }
    public string Source { get; set; } = "CIQUAL";
}
