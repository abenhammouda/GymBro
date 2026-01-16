import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import MessageInput from './MessageInput';
import authService from '../../services/auth.service';
import type { Message } from '../../types';
import './MessageList.css';

interface MessageListProps {
    messages: Message[];
    conversationId: number;
    onSendMessage: (messageText: string) => void;
    onBack: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, conversationId, onSendMessage, onBack }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = authService.getCurrentUser();
    const userType = localStorage.getItem('userType') as 'Coach' | 'Adherent' | null;

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
        if (!previousMessage) return true;

        const currentDate = new Date(currentMessage.sentAt).toDateString();
        const previousDate = new Date(previousMessage.sentAt).toDateString();

        return currentDate !== previousDate;
    };

    const isOwnMessage = (message: Message) => {
        return message.senderId === currentUser?.id && message.senderType === userType;
    };

    return (
        <div className="message-list">
            {/* Header with back button */}
            <div className="message-list__header">
                <button onClick={onBack} className="message-list__back-btn">
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="message-list__messages">
                {messages.length === 0 ? (
                    <div className="message-list__empty">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <React.Fragment key={message.messageId}>
                            {/* Date Separator */}
                            {shouldShowDateSeparator(message, messages[index - 1]) && (
                                <div className="message-list__date-separator">
                                    {formatDate(message.sentAt)}
                                </div>
                            )}

                            {/* Message */}
                            <div
                                className={`message-list__message ${isOwnMessage(message) ? 'message-list__message--own' : 'message-list__message--other'
                                    }`}
                            >
                                <div className="message-list__message-bubble">
                                    <p className="message-list__message-text">{message.messageText}</p>
                                    <div className="message-list__message-meta">
                                        <span className="message-list__message-time">{formatTime(message.sentAt)}</span>
                                        {isOwnMessage(message) && message.isRead && (
                                            <span className="message-list__message-read">✓✓</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSendMessage={onSendMessage} conversationId={conversationId} />
        </div>
    );
};

export default MessageList;
