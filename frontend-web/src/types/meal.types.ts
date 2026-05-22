export type MacroSourceKind = 'AI' | 'Manual';

export interface MealIngredient {
    mealIngredientId?: number;
    name: string;
    quantityGrams: number;
    orderIndex: number;
    calories?: number | null;
    proteins?: number | null;
    carbs?: number | null;
    fats?: number | null;
    macroSource?: MacroSourceKind | null;
    macroCalculationFailed?: boolean;
}

export interface Meal {
    mealId: number;
    mealTabId: number;
    name: string;
    description?: string;
    orderIndex: number;
    ingredients: MealIngredient[];
    totalCalories?: number | null;
    totalProteins?: number | null;
    totalCarbs?: number | null;
    totalFats?: number | null;
    hasFailedIngredients?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMealRequest {
    mealTabId: number;
    name: string;
    description?: string;
    ingredients: MealIngredient[];
    orderIndex: number;
    calculateMacrosWithAI?: boolean;
}

export interface UpdateMealRequest {
    name: string;
    description?: string;
    ingredients: MealIngredient[];
}

export interface ManualMacros {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}
