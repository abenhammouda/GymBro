import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations, getMessages, sendMessage as apiSend, markRead } from '../../services/messages.service';
import { connectSignalR, onReceiveMessage, disconnectSignalR } from '../../services/signalr.service';
import { getStoredToken } from '../../services/auth.service';
import type { MessageResponse, ConversationInfo } from '../../types/api.types';

export default function ChatTab() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const listRef = useRef<FlatList>(null);

  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const convs = await getConversations();
      if (!convs.length) { setLoading(false); return; }
      const conv = convs[0];
      setConversation(conv);
      const msgs = await getMessages(conv.conversationId);
      setMessages(msgs);
      // Mark unread as read
      msgs.filter(m => !m.isRead && m.senderType !== 'Adherent').forEach(m => markRead(m.messageId).catch(() => {}));
    } catch {}
    setLoading(false);
  }, []);

  // SignalR connection
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    (async () => {
      const token = await getStoredToken();
      if (!token) return;
      try {
        await connectSignalR(token);
        cleanup = onReceiveMessage(msg => {
          setMessages(prev => {
            if (prev.find(m => m.messageId === msg.messageId)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        });
      } catch {}
    })();
    return () => {
      cleanup?.();
      disconnectSignalR().catch(() => {});
    };
  }, []);

  useEffect(() => { load(); }, [load]);

  const send = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await apiSend(conversation.conversationId, text);
      setMessages(prev => {
        if (prev.find(m => m.messageId === msg.messageId)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { setInput(text); }
    setSending(false);
  };

  const coachName = conversation
    ? (user?.userId === conversation.adherentId ? conversation.coachName : conversation.adherentName)
    : 'Coach';
  const coachInitial = coachName[0]?.toUpperCase() ?? 'C';

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );
  }

  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="chatbubble-outline" size={40} color={C.light} />
        <Text style={{ color: C.mid, marginTop: 12, fontSize: 15 }}>Aucune conversation</Text>
        <Text style={{ color: C.light, marginTop: 6, fontSize: 13 }}>Ton coach démarrera la conversation.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.coachInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{coachInitial}</Text>
          </View>
          <View>
            <Text style={styles.coachName}>{coachName}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En ligne</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={load}>
          <Ionicons name="refresh-outline" size={20} color={C.mid} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.messageId}
        renderItem={({ item: msg }) => {
          const isMe = msg.senderType === 'Adherent';
          return (
            <View style={[styles.bubbleWrap, isMe && styles.bubbleWrapUser]}>
              {!isMe && (
                <View style={styles.coachAvatar}>
                  <Text style={styles.coachAvatarText}>{coachInitial}</Text>
                </View>
              )}
              <View style={[styles.bubble, isMe ? styles.bubbleUser : styles.bubbleCoach]}>
                <Text style={[styles.bubbleText, isMe && styles.bubbleTextUser]}>{msg.messageText}</Text>
                <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeUser]}>
                  {new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Écrire un message..."
          placeholderTextColor={C.light}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]} onPress={send}>
          {sending
            ? <ActivityIndicator size="small" color={C.light} />
            : <Ionicons name="send" size={18} color={input.trim() ? '#fff' : C.light} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  coachInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  coachName: { fontSize: 15, fontWeight: '700', color: C.text },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.green },
  onlineText: { fontSize: 12, color: C.green },
  list: { padding: 16, gap: 8 },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  bubbleWrapUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  coachAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  coachAvatarText: { color: '#fff', fontWeight: '700', fontSize: 10 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  bubbleCoach: { backgroundColor: C.white, ...shadow, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: C.blue, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: C.text, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: C.light, marginTop: 4 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 10, backgroundColor: C.white, borderTopWidth: 1, borderColor: C.border },
  textInput: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: C.bg, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: C.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: C.border },
});
