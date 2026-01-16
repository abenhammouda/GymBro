import api, { handleApiError } from './api';
import type { Message, Conversation, SendMessageRequest } from '../types';

class MessageService {
    /**
     * Get all conversations for the current user
     */
    async getConversations(): Promise<Conversation[]> {
        try {
            const response = await api.get<Conversation[]>('/messages/conversations');
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Get messages in a conversation
     */
    async getMessages(conversationId: number): Promise<Message[]> {
        try {
            const response = await api.get<Message[]>(`/messages/conversation/${conversationId}`);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Send a message (also broadcasts via SignalR)
     */
    async sendMessage(data: SendMessageRequest): Promise<Message> {
        try {
            const response = await api.post<Message>('/messages', data);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Mark a message as read
     */
    async markAsRead(messageId: number): Promise<void> {
        try {
            await api.put(`/messages/${messageId}/read`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Get unread message count
     */
    async getUnreadCount(): Promise<number> {
        try {
            const response = await api.get<{ unreadCount: number }>('/messages/unread-count');
            return response.data.unreadCount;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Get or create conversation between coach and adherent
     */
    async getOrCreateConversation(coachId: number, adherentId: number): Promise<Conversation> {
        try {
            const response = await api.post<Conversation>('/messages/conversation', {
                coachId,
                adherentId,
            });
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
}

export default new MessageService();
