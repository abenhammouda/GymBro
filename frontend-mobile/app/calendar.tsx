import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { getScheduledWorkouts, getScheduledMeals } from '../services/schedule.service';

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function buildCalendar(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (string | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const WORKOUT_COLORS = ['#3A6FE8', '#5856D6', '#34C759', '#FF9500', '#FF3B30'];

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<Record<string, { label: string; color: string }[]>>({});
  const [loading, setLoading] = useState(true);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getScheduledWorkouts(user.userId),
      getScheduledMeals(user.userId),
    ]).then(([workouts, meals]) => {
      const map: Record<string, { label: string; color: string }[]> = {};
      workouts.forEach((w, i) => {
        const d = w.scheduledDate.slice(0, 10);
        if (!map[d]) map[d] = [];
        map[d].push({ label: w.workoutSession?.name ?? 'Séance', color: WORKOUT_COLORS[i % WORKOUT_COLORS.length] });
      });
      meals.forEach(m => {
        const d = m.scheduledDate.slice(0, 10);
        if (!map[d]) map[d] = [];
        if (!map[d].find(e => e.label === m.meal?.name)) {
          map[d].push({ label: m.meal?.name ?? 'Repas', color: C.orange });
        }
      });
      setEvents(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const cells = buildCalendar(year, month);
  const monthLabel = new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={C.blue} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>Mon programme</Text>
          <Text style={styles.headerTitle}>Calendrier</Text>
        </View>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth}><Ionicons name="chevron-back" size={16} color={C.blue} /></TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={nextMonth}><Ionicons name="chevron-forward" size={16} color={C.blue} /></TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.blue} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => <Text key={i} style={styles.dayHeader}>{d}</Text>)}
            </View>
            <View style={styles.grid}>
              {cells.map((dateStr, idx) => {
                if (!dateStr) return <View key={idx} style={styles.cell} />;
                const day = parseInt(dateStr.split('-')[2]);
                const isToday = dateStr === todayStr;
                const dayEvents = events[dateStr] ?? [];
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.cell, isToday && styles.cellToday]}
                    onPress={() => dayEvents.length && router.push({ pathname: '/day-program', params: { date: dateStr } })}
                  >
                    <Text style={[styles.cellDay, isToday && styles.cellDayToday]}>{day}</Text>
                    {dayEvents.slice(0, 1).map((ev, i) => (
                      <View key={i} style={[styles.eventDot, { backgroundColor: ev.color }]} />
                    ))}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginLeft: 4 },
  headerSub: { fontSize: 11, color: C.mid },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthLabel: { fontSize: 11, color: C.mid, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, ...shadow },
  daysRow: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: C.light, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6, minHeight: 52 },
  cellToday: { backgroundColor: C.blue, borderRadius: 10 },
  cellDay: { fontSize: 13, fontWeight: '500', color: C.text, marginBottom: 3 },
  cellDayToday: { color: '#fff', fontWeight: '700' },
  eventDot: { width: 6, height: 6, borderRadius: 3 },
});
