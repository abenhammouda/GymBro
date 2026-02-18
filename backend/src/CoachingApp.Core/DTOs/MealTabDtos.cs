namespace CoachingApp.Core.DTOs;

public record MealTabResponse(
    int MealTabId,
    string Name,
    int OrderIndex,
    int MealCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateMealTabRequest(
    string Name,
    int OrderIndex
);
