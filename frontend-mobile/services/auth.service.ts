import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { API_BASE_URL, ENDPOINTS, STORAGE_KEYS } from '../constants/Api';
import type { AuthResponse, AuthUser, CoachClientInfo, LoginRequest } from '../types/api.types';

export async function login(emailOrPhone: string, password: string): Promise<AuthResponse> {
  const body: LoginRequest = { emailOrPhone, password, userType: 'Adherent' };
  const { data } = await api.post<AuthResponse>(ENDPOINTS.LOGIN, body);
  await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
  return data;
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) await api.post(ENDPOINTS.REVOKE_TOKEN, { refreshToken });
  } catch {}
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_DATA,
    STORAGE_KEYS.COACH_CLIENT_ID,
  ]);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
  return raw ? JSON.parse(raw) : null;
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function fetchAndStoreCoachClientId(adherentId: string): Promise<string | null> {
  const cached = await AsyncStorage.getItem(STORAGE_KEYS.COACH_CLIENT_ID);
  if (cached) return cached;
  try {
    const { data } = await api.get<CoachClientInfo[]>(ENDPOINTS.COACH_CLIENTS);
    const rel = data.find(r => r.adherentId === adherentId && r.status === 'Active');
    if (rel) {
      await AsyncStorage.setItem(STORAGE_KEYS.COACH_CLIENT_ID, rel.coachClientId);
      return rel.coachClientId;
    }
    return null;
  } catch {
    return null;
  }
}
