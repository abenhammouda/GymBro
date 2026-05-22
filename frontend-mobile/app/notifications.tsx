import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../constants/Colors';
import { MOCK_NOTIFICATIONS } from '../constants/MockData';

type NotifGroup = { group: string; items: typeof MOCK_NOTIFICATIONS };

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;
  const groups = MOCK_NOTIFICATIONS.reduce<NotifGroup[]>((acc, n) => {
    const last = acc[acc.length - 1];
    if (last && last.group === n.group) last.items.push(n);
    else acc.push({ group: n.group, items: [n] });
    return acc;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={C.blue} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.unreadBadge}>{unreadCount} non lues</Text>}
        </View>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={20} color={C.mid} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {groups.map(group => (
          <View key={group.group}>
            <Text style={styles.groupLabel}>{group.group}</Text>
            {group.items.map(notif => (
              <TouchableOpacity key={notif.id} style={[styles.notifItem, notif.unread && styles.notifItemUnread]}>
                <View style={[styles.iconWrap, { backgroundColor: notif.color + '20' }]}>
                  <Ionicons name={notif.icon as any} size={18} color={notif.color} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                {notif.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border, gap: 8 },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  unreadBadge: { fontSize: 12, color: C.mid, backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  scroll: { flex: 1 },
  content: { paddingTop: 8 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: C.light, letterSpacing: 0.8, paddingHorizontal: 20, paddingVertical: 12, paddingTop: 16 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  notifItemUnread: { backgroundColor: '#FAFCFF' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 3 },
  notifBody: { fontSize: 13, color: C.mid, lineHeight: 18, marginBottom: 5 },
  notifTime: { fontSize: 11, color: C.light },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue, marginTop: 6 },
});
