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

export interface SupplementGroup {
    supplementGroupId?: number;
    name: string;
    orderIndex: number;
    items: SupplementSetItem[];
}

export interface SupplementSet {
    supplementSetId: number;
    timing: SupplementTiming;
    index: number;
    orderIndex: number;
    groups: SupplementGroup[];
    createdAt: string;
    updatedAt: string;
}

export const isStandardUnit = (u: string): u is StandardUnit =>
    (STANDARD_UNITS as readonly string[]).includes(u);

export const formatTimingLabel = (timing: SupplementTiming, index: number): string => {
    switch (timing) {
        case 'PreMeal': return `Pré-Repas ${index}`;
        case 'PostMeal': return `Post-Repas ${index}`;
        case 'PreWorkout': return `Pré-Workout ${index}`;
        case 'PostWorkout': return `Post-Workout ${index}`;
    }
};

export const shortTimingLabel = (timing: SupplementTiming, index: number): string => {
    const pre = timing === 'PreMeal' || timing === 'PreWorkout';
    return `${pre ? 'Pré' : 'Post'}-${index}`;
};

export const isMealTiming = (t: SupplementTiming) =>
    t === 'PreMeal' || t === 'PostMeal';

export const isWorkoutTiming = (t: SupplementTiming) =>
    t === 'PreWorkout' || t === 'PostWorkout';

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
    groups: (raw.groups || []).map((g: any) => ({
        supplementGroupId: g.supplementGroupId ?? undefined,
        name: g.name,
        orderIndex: g.orderIndex,
        items: (g.items || []).map((i: any) => ({
            supplementSetItemId: i.supplementSetItemId ?? undefined,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            orderIndex: i.orderIndex,
        })),
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

    delete: async (setId: number): Promise<void> => {
        await api.delete(`/supplement-sets/${setId}`);
    },

    addGroup: async (setId: number, name: string): Promise<SupplementSet> => {
        const response = await api.post(`/supplement-sets/${setId}/groups`, { name });
        return normalizeSet(response.data);
    },

    renameGroup: async (setId: number, groupId: number, name: string): Promise<SupplementSet> => {
        const response = await api.put(`/supplement-sets/${setId}/groups/${groupId}`, { name });
        return normalizeSet(response.data);
    },

    deleteGroup: async (setId: number, groupId: number): Promise<void> => {
        await api.delete(`/supplement-sets/${setId}/groups/${groupId}`);
    },

    updateGroupItems: async (
        setId: number,
        groupId: number,
        items: SupplementSetItem[]
    ): Promise<SupplementSet> => {
        const response = await api.put(`/supplement-sets/${setId}/groups/${groupId}/items`, { items });
        return normalizeSet(response.data);
    },
};
