import React from 'react';
import { User } from 'lucide-react';
import type { Conversation } from '../../types';
import './ConversationList.css';

interface ConversationListProps {
    conversations: Conversation[];
    onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelectConversation }) => {
    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const userType = localStorage.getItem('userType') as 'Coach' | 'Adherent' | null;

    if (conversations.length === 0) {
        return (
            <div className="conversation-list__empty">
                <User size={48} className="conversation-list__empty-icon" />
                <p className="conversation-list__empty-text">No conversations yet</p>
                <p className="conversation-list__empty-subtext">
                    {userType === 'Coach'
                        ? 'Start messaging with your clients to track their progress and provide guidance.'
                        : 'Start messaging with your coaches to get personalized support and guidance.'}
                </p>
            </div>
        );
    }

    return (
        <div className="conversation-list">
            {conversations.map((conversation) => (
                <div
                    key={conversation.conversationId}
                    className="conversation-list__item"
                    onClick={() => onSelectConversation(conversation)}
                >
                    <div className="conversation-list__avatar">
                        <User size={24} />
                    </div>
                    <div className="conversation-list__content">
                        <div className="conversation-list__header">
                            <span className="conversation-list__name">
                                {conversation.participantName || 'Unknown'}
                            </span>
                            <span className="conversation-list__time">
                                {formatTime(conversation.lastMessageAt || conversation.createdAt)}
                            </span>
                        </div>
                        <div className="conversation-list__preview">
                            <span className="conversation-list__message">
                                {conversation.lastMessage
                                    ? truncateText(conversation.lastMessage.messageText, 50)
                                    : 'No messages yet'}
                            </span>
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <span className="conversation-list__unread-badge">
                                    {conversation.unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ConversationList;
