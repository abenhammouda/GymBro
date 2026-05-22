import api from './api';
import { ENDPOINTS } from '../constants/Api';
import type { MacroPlanDto } from '../types/api.types';

export async function getCurrentMacroPlan(coachClientId: string): Promise<MacroPlanDto | null> {
  try {
    const { data } = await api.get<MacroPlanDto>(ENDPOINTS.MACRO_PLAN_CURRENT(coachClientId));
    return data;
  } catch {
    return null;
  }
}
