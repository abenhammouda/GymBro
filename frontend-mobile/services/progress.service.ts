import api from './api';
import { ENDPOINTS } from '../constants/Api';
import type { WeeklyProgressDto, SubmitProgressRequest } from '../types/api.types';

export async function getWeeklyProgress(coachClientId: string): Promise<WeeklyProgressDto[]> {
  const { data } = await api.get<WeeklyProgressDto[]>(ENDPOINTS.WEEKLY_PROGRESS(coachClientId));
  return data;
}

export async function getLatestWeight(coachClientId: string): Promise<number | null> {
  const progress = await getWeeklyProgress(coachClientId);
  if (!progress.length) return null;
  const sorted = [...progress].sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );
  return sorted[0].currentWeight;
}

export async function getWeightHistory(
  coachClientId: string
): Promise<{ label: string; weight: number }[]> {
  const progress = await getWeeklyProgress(coachClientId);
  return progress
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map(p => ({ label: `S${String(p.weekNumber).padStart(2, '0')}`, weight: p.currentWeight }));
}

export async function submitWeeklyProgress(req: SubmitProgressRequest): Promise<WeeklyProgressDto> {
  const { data } = await api.post<WeeklyProgressDto>(ENDPOINTS.WEEKLY_PROGRESS_SUBMIT, req);
  return data;
}
