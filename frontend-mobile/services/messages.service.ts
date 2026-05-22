import api from './api';
import { ENDPOINTS } from '../constants/Api';
import type { ConversationInfo, MessageResponse } from '../types/api.types';

export async function getConversations(): Promise<ConversationInfo[]> {
  const { data } = await api.get<ConversationInfo[]>(ENDPOINTS.CONVERSATIONS);
  return data;
}

export async function getMessages(conversationId: string): Promise<MessageResponse[]> {
  const { data } = await api.get<MessageResponse[]>(
    ENDPOINTS.CONVERSATION_MESSAGES(conversationId)
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  messageText: string
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(ENDPOINTS.SEND_MESSAGE, {
    conversationId,
    messageText,
  });
  return data;
}

export async function markRead(messageId: string): Promise<void> {
  await api.put(ENDPOINTS.MARK_READ(messageId));
}
