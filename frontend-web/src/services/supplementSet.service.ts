import api from './api';

export type SupplementTiming = 'PreMeal' | 'PostMeal' | 'PreWorkout' | 'PostWorkout';
export type SupplementKind = 'Meal' | 'Workout';

export const STANDARD_UNITS = [
    'g', 'mg', 'mcg', 'ml', 'UI', 'caps', 'tabs', 'scoop', 'sachet'
] as const;

export type StandardUnit = typeof STANDARD_UNITS[number];

export const CUSTOM_UNIT_MAX = 8;

export interface SupplementSetItem {
    supplementSetItemId?: number;
    name: string;
    quantity: number;
    unit: string;
    orderIndex: number;
}

export interface SupplementSet {
    supplementSetId: number;
    timing: SupplementTiming;
    index: number;
    orderIndex: number;
    items: SupplementSetItem[];
    createdAt: string;
    updatedAt: string;
}

export const isStandardUnit = (u: string): u is StandardUnit =>
    (STANDARD_UNITS as readonly string[]).includes(u);

export const formatTimingLabel = (timing: SupplementTiming, index: number): string => {
    switch (timing) {
        case 'PreMeal': return `Pre-Repas ${index}`;
        case 'PostMeal': return `Post-Repas ${index}`;
        case 'PreWorkout': return `Pre-Workout ${index}`;
        case 'PostWorkout': return `Post-Workout ${index}`;
    }
};

export const isMealTiming = (t: SupplementTiming) =>
    t === 'PreMeal' || t === 'PostMeal';

export const isWorkoutTiming = (t: SupplementTiming) =>
    t === 'PreWorkout' || t === 'PostWorkout';

// The backend serializes the enum as an integer. We expose it as a label string
// but the API returns numeric values; convert below.
const TIMING_FROM_ENUM: Record<number, SupplementTiming> = {
    0: 'PreMeal',
    1: 'PostMeal',
    2: 'PreWorkout',
    3: 'PostWorkout',
};

const normalizeSet = (raw: any): SupplementSet => ({
    supplementSetId: raw.supplementSetId,
    timing: typeof raw.timing === 'number' ? TIMING_FROM_ENUM[raw.timing] : raw.timing,
    index: raw.index,
    orderIndex: raw.orderIndex,
    items: (raw.items || []).map((i: any) => ({
        supplementSetItemId: i.supplementSetItemId ?? undefined,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        orderIndex: i.orderIndex,
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
});

export const supplementSetService = {
    getAll: async (): Promise<SupplementSet[]> => {
        const response = await api.get('/supplement-sets');
        return (response.data as any[]).map(normalizeSet);
    },

    addNext: async (kind: SupplementKind): Promise<SupplementSet> => {
        const response = await api.post(`/supplement-sets/next?kind=${kind}`);
        return normalizeSet(response.data);
    },

    updateItems: async (
        setId: number,
        items: SupplementSetItem[]
    ): Promise<SupplementSet> => {
        const response = await api.put(`/supplement-sets/${setId}/items`, { items });
        return normalizeSet(response.data);
    },

    delete: async (setId: number): Promise<void> => {
        await api.delete(`/supplement-sets/${setId}`);
    },
};
