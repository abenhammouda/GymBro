import api from './api';
import { ENDPOINTS } from '../constants/Api';
import type { ScheduledWorkoutResponse, ScheduledMealResponse } from '../types/api.types';

function isSameDay(isoDate: string, target: Date): boolean {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
}

export async function getScheduledWorkouts(adherentId: string): Promise<ScheduledWorkoutResponse[]> {
  const { data } = await api.get<ScheduledWorkoutResponse[]>(
    ENDPOINTS.SCHEDULED_WORKOUTS_CLIENT(adherentId)
  );
  return data;
}

export async function getTodayWorkout(adherentId: string): Promise<ScheduledWorkoutResponse | null> {
  const all = await getScheduledWorkouts(adherentId);
  const today = new Date();
  return all.find(s => isSameDay(s.scheduledDate, today)) ?? null;
}

export async function getWorkoutByDate(
  adherentId: string,
  date: Date
): Promise<ScheduledWorkoutResponse | null> {
  const all = await getScheduledWorkouts(adherentId);
  return all.find(s => isSameDay(s.scheduledDate, date)) ?? null;
}

export async function completeWorkout(scheduledId: string): Promise<void> {
  await api.put(ENDPOINTS.SCHEDULED_WORKOUT(scheduledId), { status: 'completed' });
}

export async function getScheduledMeals(adherentId: string): Promise<ScheduledMealResponse[]> {
  const { data } = await api.get<ScheduledMealResponse[]>(
    ENDPOINTS.SCHEDULED_MEALS_CLIENT(adherentId)
  );
  return data;
}

export async function getTodayMeals(adherentId: string): Promise<ScheduledMealResponse[]> {
  const all = await getScheduledMeals(adherentId);
  const today = new Date();
  return all.filter(m => isSameDay(m.scheduledDate, today));
}

export async function getMealsByDate(
  adherentId: string,
  date: Date
): Promise<ScheduledMealResponse[]> {
  const all = await getScheduledMeals(adherentId);
  return all.filter(m => isSameDay(m.scheduledDate, date));
}
