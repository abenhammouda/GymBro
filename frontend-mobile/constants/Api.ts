import { Platform } from 'react-native';

// Physical device → use your LAN IP
// Android emulator → 10.0.2.2
// iOS simulator → localhost
const LAN_IP = '192.168.1.177';

export const API_BASE_URL =
  Platform.OS === 'android' && !__DEV__
    ? `http://${LAN_IP}:5085`
    : Platform.OS === 'android'
    ? `http://10.0.2.2:5085`
    : `http://${LAN_IP}:5085`;

export const SIGNALR_HUB_URL = `${API_BASE_URL}/hubs/message`;

export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER_ADHERENT: '/api/auth/register/adherent',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  REVOKE_TOKEN: '/api/auth/revoke-token',

  // Coach-client relationship
  COACH_CLIENTS: '/api/coachclients',

  // Scheduled workouts
  SCHEDULED_WORKOUTS_CLIENT: (adherentId: string) =>
    `/api/scheduledworkoutsessions/client/${adherentId}`,
  SCHEDULED_WORKOUT: (id: string) => `/api/scheduledworkoutsessions/${id}`,

  // Scheduled meals
  SCHEDULED_MEALS_CLIENT: (adherentId: string) =>
    `/api/scheduledmeals/client/${adherentId}`,

  // Macro plans
  MACRO_PLAN_CURRENT: (coachClientId: string) =>
    `/api/macroplans/${coachClientId}/current`,

  // Weekly progress
  WEEKLY_PROGRESS: (coachClientId: string) =>
    `/api/weeklyprogress/${coachClientId}`,
  WEEKLY_PROGRESS_SUBMIT: '/api/weeklyprogress',

  // Messages
  CONVERSATIONS: '/api/messages/conversations',
  CONVERSATION_MESSAGES: (conversationId: string) =>
    `/api/messages/conversation/${conversationId}`,
  SEND_MESSAGE: '/api/messages',
  MARK_READ: (messageId: string) => `/api/messages/${messageId}/read`,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  COACH_CLIENT_ID: 'coach_client_id',
};
