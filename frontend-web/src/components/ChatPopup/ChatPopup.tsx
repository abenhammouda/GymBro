import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import messageService from '../../services/message.service';
import signalRService from '../../services/signalr.service';
import authService from '../../services/auth.service';
import type { Conversation, Message } from '../../types';
import './ChatPopup.css';

const ChatPopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Use refs to avoid closure issues with SignalR listeners
    const selectedConversationRef = useRef<Conversation | null>(null);
    const isOpenRef = useRef(false);
    const isMinimizedRef = useRef(false);

    // Update refs when state changes
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        isMinimizedRef.current = isMinimized;
    }, [isMinimized]);

    useEffect(() => {
        initializeChat();
        return () => {
            signalRService.disconnect();
        };
    }, []);

    const initializeChat = async () => {
        try {
            // Connect to SignalR
            const token = authService.getToken();
            if (token) {
                await signalRService.connect(token);
                setupSignalRListeners();
            }

            // Load conversations and unread count
            await loadConversations();
            await loadUnreadCount();
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        }
    };

    const setupSignalRListeners = () => {
        signalRService.on('ReceiveMessage', handleReceiveMessage);
        signalRService.on('MessageRead', handleMessageRead);
        signalRService.on('UserTyping', handleUserTyping);
    };

    const handleReceiveMessage = (message: Message) => {
        console.log('📨 handleReceiveMessage called:', {
            messageId: message.messageId,
            conversationId: message.conversationId,
            messageText: message.messageText,
            selectedConversationId: selectedConversationRef.current?.conversationId,
            isOpen: isOpenRef.current,
            isMinimized: isMinimizedRef.current
        });

        // Add or update message in current conversation if it's selected
        if (selectedConversationRef.current && message.conversationId === selectedConversationRef.current.conversationId) {
            console.log('✅ Message is for current conversation, adding to list');
            setMessages(prev => {
                // Check if this is replacing an optimistic message (same text, recent timestamp)
                const optimisticIndex = prev.findIndex(m =>
                    m.messageText === message.messageText &&
                    m.senderId === message.senderId &&
                    Date.now() - m.messageId < 5000 // Within last 5 seconds
                );

                if (optimisticIndex !== -1) {
                    console.log('🔄 Replacing optimistic message at index:', optimisticIndex);
                    // Replace optimistic message with real one
                    const newMessages = [...prev];
                    newMessages[optimisticIndex] = message;
                    return newMessages;
                } else {
                    console.log('➕ Adding new message to list');
                    // Add new message
                    return [...prev, message];
                }
            });

            // Mark as read if chat is open
            if (isOpenRef.current && !isMinimizedRef.current) {
                messageService.markAsRead(message.messageId);
            }
        } else {
            console.log('❌ Message NOT for current conversation or no conversation selected');
        }

        // Update conversations list
        loadConversations();
        loadUnreadCount();
    };

    const handleMessageRead = ({ messageId }: { messageId: number }) => {
        setMessages(prev =>
            prev.map(m => (m.messageId === messageId ? { ...m, isRead: true } : m))
        );
    };

    const handleUserTyping = ({ userId, userType }: { userId: number; userType: string }) => {
        // TODO: Show typing indicator
        console.log(`User ${userType} ${userId} is typing...`);
    };

    const loadConversations = async () => {
        try {
            const data = await messageService.getConversations();
            setConversations(data);
        } catch (error: any) {
            console.error('Failed to load conversations:', error);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const count = await messageService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const handleConversationSelect = async (conversation: Conversation) => {
        setIsLoading(true);
        setError('');
        try {
            // Leave previous conversation
            if (selectedConversation) {
                await signalRService.leaveConversation(selectedConversation.conversationId);
            }

            // Join new conversation
            await signalRService.joinConversation(conversation.conversationId);

            // Load messages
            const msgs = await messageService.getMessages(conversation.conversationId);
            setMessages(msgs);
            setSelectedConversation(conversation);

            // Mark unread messages as read
            const unreadMessages = msgs.filter(m => !m.isRead && m.senderId !== authService.getCurrentUser()?.id);
            for (const msg of unreadMessages) {
                await messageService.markAsRead(msg.messageId);
            }

            await loadUnreadCount();
        } catch (error: any) {
            setError(error.message || 'Failed to load conversation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (messageText: string) => {
        if (!selectedConversation) return;

        try {
            const currentUser = authService.getCurrentUser();
            const userType = localStorage.getItem('userType') as 'Coach' | 'Adherent' | null;
            if (!currentUser || !userType) return;

            // Get the correct user ID based on type
            const userId = userType === 'Coach' ? currentUser.coachId : currentUser.adherentId;
            if (!userId) {
                console.error('Could not determine user ID', { currentUser, userType });
                return;
            }

            // Create optimistic message for immediate display
            const optimisticMessage: Message = {
                messageId: Date.now(), // Temporary ID
                conversationId: selectedConversation.conversationId,
                senderId: userId,
                senderType: userType,
                messageText,
                isRead: false,
                sentAt: new Date().toISOString(),
                readAt: undefined
            };

            // Add message immediately to UI for instant feedback
            setMessages(prev => [...prev, optimisticMessage]);

            // Send via SignalR (which also saves to DB)
            await signalRService.sendMessage(selectedConversation.conversationId, messageText);
        } catch (error: any) {
            setError(error.message || 'Failed to send message');
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.messageId !== Date.now()));
        }
    };

    const handleBack = async () => {
        if (selectedConversation) {
            await signalRService.leaveConversation(selectedConversation.conversationId);
        }
        setSelectedConversation(null);
        setMessages([]);
        await loadConversations();
    };

    const togglePopup = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const closePopup = () => {
        setIsOpen(false);
        setIsMinimized(false);
        if (selectedConversation) {
            signalRService.leaveConversation(selectedConversation.conversationId);
            setSelectedConversation(null);
            setMessages([]);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button className="chat-popup__button" onClick={togglePopup}>
                <MessageCircle size={24} />
                {unreadCount > 0 && (
                    <span className="chat-popup__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className={`chat-popup__container ${isMinimized ? 'chat-popup__container--minimized' : ''}`}>
                    {/* Header */}
                    <div className="chat-popup__header">
                        <div className="chat-popup__header-title">
                            <MessageCircle size={20} />
                            <span>{selectedConversation ? selectedConversation.participantName : 'Messages'}</span>
                        </div>
                        <div className="chat-popup__header-actions">
                            <button onClick={toggleMinimize} className="chat-popup__header-btn">
                                <Minimize2 size={18} />
                            </button>
                            <button onClick={closePopup} className="chat-popup__header-btn">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <div className="chat-popup__content">
                            {error && <div className="chat-popup__error">{error}</div>}

                            {isLoading ? (
                                <div className="chat-popup__loading">Loading...</div>
                            ) : selectedConversation ? (
                                <MessageList
                                    messages={messages}
                                    conversationId={selectedConversation.conversationId}
                                    onSendMessage={handleSendMessage}
                                    onBack={handleBack}
                                />
                            ) : (
                                <ConversationList
                                    conversations={conversations}
                                    onSelectConversation={handleConversationSelect}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatPopup;
