namespace CoachingApp.Core.DTOs;

public record MealIngredientDto(
    int? MealIngredientId,
    string Name,
    decimal QuantityGrams,
    int OrderIndex,
    decimal? Calories,
    decimal? Proteins,
    decimal? Carbs,
    decimal? Fats,
    string? MacroSource,
    bool MacroCalculationFailed
);

public record MealResponse(
    int MealId,
    int MealTabId,
    string Name,
    string? Description,
    string? ImageUrl,
    int OrderIndex,
    List<MealIngredientDto> Ingredients,
    decimal? TotalCalories,
    decimal? TotalProteins,
    decimal? TotalCarbs,
    decimal? TotalFats,
    bool HasFailedIngredients,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateMealRequest(
    int MealTabId,
    string Name,
    string? Description,
    List<MealIngredientDto> Ingredients,
    int OrderIndex,
    bool CalculateMacrosWithAI = false
);

public record UpdateMealRequest(
    string Name,
    string? Description,
    List<MealIngredientDto> Ingredients
);

public record ManualMacrosDto(
    decimal Calories,
    decimal Proteins,
    decimal Carbs,
    decimal Fats
);
