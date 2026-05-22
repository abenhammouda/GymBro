import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { getTodayWorkout } from '../services/schedule.service';
import { completeWorkout } from '../services/schedule.service';
import type { ScheduledWorkoutResponse, WorkoutSessionExercise } from '../types/api.types';

type WorkoutSet = { set: number; weight: number | null; reps: number | null; rpe: number | null; done: boolean };

function buildSets(exercise: WorkoutSessionExercise): WorkoutSet[] {
  return Array.from({ length: exercise.sets }, (_, i) => ({
    set: i + 1,
    weight: null,
    reps: exercise.reps,
    rpe: null,
    done: false,
  }));
}

export default function WorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { scheduledId } = useLocalSearchParams<{ scheduledId?: string }>();

  const [workout, setWorkout] = useState<ScheduledWorkoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [setsMap, setSetsMap] = useState<Record<number, WorkoutSet[]>>({});

  useEffect(() => {
    if (!user) return;
    getTodayWorkout(user.userId).then(w => {
      setWorkout(w);
      if (w?.workoutSession?.exercises) {
        const map: Record<number, WorkoutSet[]> = {};
        w.workoutSession.exercises.forEach((ex, i) => { map[i] = buildSets(ex); });
        setSetsMap(map);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, scheduledId]);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    setSetsMap(prev => ({
      ...prev,
      [exIdx]: prev[exIdx].map((s, i): WorkoutSet =>
        i === setIdx ? { ...s, done: !s.done, rpe: s.rpe ?? 7 } : s
      ),
    }));
  };

  const handleFinish = async () => {
    if (workout?.scheduledWorkoutSessionId) {
      await completeWorkout(workout.scheduledWorkoutSessionId).catch(() => {});
    }
    router.replace('/workout-done');
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );
  }

  const exercises = workout?.workoutSession?.exercises ?? [];
  const currentEx = exercises[currentExIdx];
  const currentSets = setsMap[currentExIdx] ?? [];
  const completedEx = exercises.filter((_, i) => (setsMap[i] ?? []).every(s => s.done)).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={C.mid} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>SÉANCE EN COURS</Text>
          <Text style={styles.headerTitle}>{workout?.workoutSession?.name ?? 'Séance'}</Text>
        </View>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{fmt(seconds)}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <Text style={styles.progressLabel}>Progression</Text>
        <Text style={styles.progressCount}>{completedEx} / {exercises.length} exercices</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: exercises.length ? `${(completedEx / exercises.length) * 100}%` as any : '0%' }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentEx && (
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseBadgeRow}>
              <View style={styles.exerciseBadge}>
                <Text style={styles.exerciseBadgeText}>{currentExIdx + 1}</Text>
              </View>
              <View style={styles.exerciseTitleWrap}>
                <Text style={styles.exerciseName}>{currentEx.exerciseName}</Text>
                <Text style={styles.exerciseDetail}>{currentEx.sets}×{currentEx.reps} · {currentEx.restSeconds}s repos</Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                {['#', 'REPS', 'RPE', ''].map((h, i) => (
                  <Text key={i} style={[styles.tableHeaderCell, i === 0 && styles.colNum]}>{h}</Text>
                ))}
              </View>
              {currentSets.map((s, i) => (
                <View key={i} style={[styles.tableRow, s.done && styles.tableRowDone]}>
                  <Text style={[styles.tableCell, styles.colNum]}>{s.set}</Text>
                  <Text style={styles.tableCell}>{s.reps ?? '—'}</Text>
                  <Text style={styles.tableCell}>{s.rpe ?? '—'}</Text>
                  <TouchableOpacity onPress={() => toggleSet(currentExIdx, i)} style={[styles.checkCircle, s.done && styles.checkCircleDone]}>
                    {s.done && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Exercise navigation */}
        <View style={styles.exNav}>
          {currentExIdx > 0 && (
            <TouchableOpacity style={styles.exNavBtn} onPress={() => setCurrentExIdx(i => i - 1)}>
              <Ionicons name="chevron-back" size={16} color={C.blue} />
              <Text style={styles.exNavText}>Précédent</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {currentExIdx < exercises.length - 1 && (
            <TouchableOpacity style={styles.exNavBtn} onPress={() => setCurrentExIdx(i => i + 1)}>
              <Text style={styles.exNavText}>Suivant</Text>
              <Ionicons name="chevron-forward" size={16} color={C.blue} />
            </TouchableOpacity>
          )}
        </View>

        {/* Upcoming */}
        {exercises.slice(currentExIdx + 1, currentExIdx + 3).map((ex, i) => (
          <View key={i} style={styles.upcomingRow}>
            <Text style={styles.upcomingNum}>{currentExIdx + i + 2}</Text>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingName}>{ex.exerciseName}</Text>
              <Text style={styles.upcomingDetail}>{ex.sets}×{ex.reps}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>Terminer la séance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border, gap: 10 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerLabel: { fontSize: 10, color: C.mid, fontWeight: '600', letterSpacing: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  timerBadge: { backgroundColor: C.greenBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  timerText: { fontSize: 14, fontWeight: '700', color: C.green, fontVariant: ['tabular-nums'] },
  progressBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, backgroundColor: C.white },
  progressLabel: { fontSize: 12, color: C.mid },
  progressCount: { fontSize: 12, fontWeight: '600', color: C.text },
  progressTrack: { height: 3, backgroundColor: C.border, marginHorizontal: 16, marginBottom: 12 },
  progressFill: { height: 3, backgroundColor: C.blue, borderRadius: 2 },
  scroll: { flex: 1 },
  content: { padding: 16 },
  exerciseCard: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 14, ...shadow },
  exerciseBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  exerciseBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  exerciseBadgeText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  exerciseTitleWrap: { flex: 1 },
  exerciseName: { fontSize: 17, fontWeight: '700', color: C.text },
  exerciseDetail: { fontSize: 12, color: C.mid, marginTop: 2 },
  table: {},
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1.5, borderColor: C.border, marginBottom: 2 },
  tableHeaderCell: { flex: 1, fontSize: 10, fontWeight: '700', color: C.light, letterSpacing: 0.5, textAlign: 'center' },
  colNum: { flex: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: C.border, alignItems: 'center' },
  tableRowDone: { backgroundColor: C.greenBg },
  tableCell: { flex: 1, fontSize: 14, color: C.text, textAlign: 'center', fontWeight: '500' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  checkCircleDone: { backgroundColor: C.green, borderColor: C.green },
  exNav: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  exNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 4 },
  exNavText: { color: C.blue, fontWeight: '600', fontSize: 13 },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 8, ...shadow },
  upcomingNum: { fontSize: 13, fontWeight: '600', color: C.light, width: 20 },
  upcomingInfo: { flex: 1 },
  upcomingName: { fontSize: 14, fontWeight: '600', color: C.text },
  upcomingDetail: { fontSize: 12, color: C.mid, marginTop: 2 },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: C.white, borderTopWidth: 1, borderColor: C.border },
  finishBtn: { backgroundColor: C.text, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  finishBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
