namespace CoachingApp.Core.DTOs;

public record MealIngredientDto(
    string Name,
    decimal QuantityGrams,
    string Type,
    int OrderIndex
);

public record MealResponse(
    int MealId,
    int MealTabId,
    string Name,
    string? Description,
    string? ImageUrl,
    int OrderIndex,
    List<MealIngredientDto> Ingredients,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateMealRequest(
    int MealTabId,
    string Name,
    string? Description,
    List<MealIngredientDto> Ingredients,
    int OrderIndex
);

public record UpdateMealRequest(
    string Name,
    string? Description,
    List<MealIngredientDto> Ingredients
);
