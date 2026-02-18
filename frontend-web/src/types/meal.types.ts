export interface MealIngredient {
    name: string;
    quantityGrams: number;
    type: 'Aliment' | 'Complement';
    orderIndex: number;
}

export interface Meal {
    mealId: number;
    mealTabId: number;
    name: string;
    description?: string;
    imageUrl?: string;
    orderIndex: number;
    ingredients: MealIngredient[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateMealRequest {
    mealTabId: number;
    name: string;
    description?: string;
    ingredients: MealIngredient[];
    orderIndex: number;
}

export interface UpdateMealRequest {
    name: string;
    description?: string;
    ingredients: MealIngredient[];
}
