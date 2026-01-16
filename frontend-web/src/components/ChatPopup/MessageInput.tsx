import React, { useState } from 'react';
import { Send } from 'lucide-react';
import signalRService from '../../services/signalr.service';
import './MessageInput.css';

interface MessageInputProps {
    onSendMessage: (messageText: string) => void;
    conversationId: number;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, conversationId }) => {
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = React.useRef<number | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);

        // Trigger typing indicator
        if (!isTyping) {
            setIsTyping(true);
            signalRService.userTyping(conversationId);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedText = messageText.trim();
        if (!trimmedText) return;

        onSendMessage(trimmedText);
        setMessageText('');
        setIsTyping(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form className="message-input" onSubmit={handleSubmit}>
            <textarea
                className="message-input__textarea"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={5000}
            />
            <button
                type="submit"
                className="message-input__send-btn"
                disabled={!messageText.trim()}
            >
                <Send size={20} />
            </button>
        </form>
    );
};

export default MessageInput;
