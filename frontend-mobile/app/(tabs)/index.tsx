import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle } from 'react-native-svg';
import { C, shadow } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getTodayWorkout, getTodayMeals } from '../../services/schedule.service';
import { getCurrentMacroPlan } from '../../services/macros.service';
import { getLatestWeight, getWeeklyProgress } from '../../services/progress.service';
import type { ScheduledWorkoutResponse, ScheduledMealResponse, MacroPlanDto } from '../../types/api.types';

const R = 40, STROKE = 8, CIRC = 2 * Math.PI * R;

export default function HomeTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, coachClientId } = useAuth();

  const [workout, setWorkout] = useState<ScheduledWorkoutResponse | null>(null);
  const [meals, setMeals] = useState<ScheduledMealResponse[]>([]);
  const [macros, setMacros] = useState<MacroPlanDto | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [weightDelta, setWeightDelta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!user || !coachClientId) return;
    if (!silent) setLoading(true);
    try {
      const [w, m, mac, progress] = await Promise.all([
        getTodayWorkout(user.userId),
        getTodayMeals(user.userId),
        getCurrentMacroPlan(coachClientId),
        getWeeklyProgress(coachClientId),
      ]);
      setWorkout(w);
      setMeals(m);
      setMacros(mac);
      if (progress.length) {
        const sorted = [...progress].sort((a, b) => b.weekNumber - a.weekNumber);
        setWeight(sorted[0].currentWeight);
        if (sorted.length >= 2) setWeightDelta(sorted[0].currentWeight - sorted[sorted.length - 1].currentWeight);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [user, coachClientId]);

  const kcalDone = meals.reduce((s, m) => s + (m.meal?.totalCalories ?? 0), 0);
  const proteinDone = meals.reduce((s, m) => s + (m.meal?.totalProteins ?? 0), 0);
  const carbsDone = meals.reduce((s, m) => s + (m.meal?.totalCarbs ?? 0), 0);
  const fatDone = meals.reduce((s, m) => s + (m.meal?.totalFats ?? 0), 0);
  const kcalTarget = macros?.calories ?? 1800;
  const pct = Math.min(Math.round((kcalDone / kcalTarget) * 100), 100);
  const filled = (pct / 100) * CIRC;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour 🔥</Text>
          <Text style={styles.name}>{user?.name ?? 'Toi'}</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/notifications')}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.blue} />}
      >
        {/* Session du jour */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Séance du jour</Text>
          <Text style={styles.sectionSub}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long' })}</Text>
        </View>

        {workout ? (
          <TouchableOpacity onPress={() => router.push('/day-program')} activeOpacity={0.92}>
            <LinearGradient colors={['#3A6FE8', '#2B59C4']} style={styles.sessionCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.sessionName}>{workout.workoutSession?.name ?? 'Séance'}</Text>
              <View style={styles.sessionMeta}>
                {workout.workoutSession?.exercises?.length ? (
                  <MetaBadge icon="barbell-outline" text={`${workout.workoutSession.exercises.length} exercices`} />
                ) : null}
                {workout.workoutSession?.duration ? (
                  <MetaBadge icon="time-outline" text={`${workout.workoutSession.duration} min`} />
                ) : null}
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={() => router.push({ pathname: '/workout', params: { scheduledId: workout.scheduledWorkoutSessionId } })}>
                <Text style={styles.startBtnText}>Commencer la séance →</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[styles.card, styles.emptyCard]}>
            <Ionicons name="calendar-outline" size={28} color={C.light} />
            <Text style={styles.emptyText}>Pas de séance prévue aujourd'hui</Text>
          </View>
        )}

        {/* Nutrition */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nutrition aujourd'hui</Text>
          <Text style={styles.sectionSub}>{kcalDone} / {kcalTarget} kcal</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.nutritionRow}>
            <View style={styles.donutContainer}>
              <Svg width={96} height={96}>
                <Circle cx={48} cy={48} r={R} fill="none" stroke={C.border} strokeWidth={STROKE} />
                <Circle cx={48} cy={48} r={R} fill="none" stroke={C.blue} strokeWidth={STROKE}
                  strokeDasharray={`${filled} ${CIRC - filled}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
              </Svg>
              <View style={styles.donutCenter}>
                <Text style={styles.donutPct}>{pct}%</Text>
                <Text style={styles.donutSub}>kcal</Text>
              </View>
            </View>
            <View style={styles.macros}>
              <MacroRow label="Protéines" done={proteinDone} target={macros?.proteinGrams ?? 130} color={C.blue} />
              <MacroRow label="Glucides" done={carbsDone} target={macros?.carbsGrams ?? 180} color={C.orange} />
              <MacroRow label="Lipides" done={fatDone} target={macros?.fatGrams ?? 55} color={C.red} />
            </View>
          </View>
        </View>

        {/* Progression */}
        {weight != null && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Progression</Text>
              {weightDelta != null && <Text style={styles.sectionSub}>{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg depuis le début</Text>}
            </View>
            <View style={[styles.card, styles.progressCard]}>
              <View style={styles.weightRow}>
                <View>
                  <Text style={styles.weightBig}>{weight.toFixed(1)} <Text style={styles.weightUnit}>kg</Text></Text>
                </View>
                <TouchableOpacity style={styles.calendarBtn} onPress={() => router.push('/calendar')}>
                  <Ionicons name="calendar-outline" size={18} color={C.blue} />
                  <Text style={styles.calendarBtnText}>Calendrier</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function MetaBadge({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.metaBadge}>
      <Ionicons name={icon} size={12} color="rgba(255,255,255,0.8)" />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function MacroRow({ label, done, target, color }: { label: string; done: number; target: number; color: string }) {
  const pct = Math.min((done / (target || 1)) * 100, 100);
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLabelRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{Math.round(done)}/{target}g</Text>
      </View>
      <View style={styles.macroBar}>
        <View style={[styles.macroBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  greeting: { fontSize: 13, color: C.mid },
  name: { fontSize: 22, fontWeight: '700', color: C.text },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  sectionSub: { fontSize: 12, color: C.mid },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 20, ...shadow },
  emptyCard: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  emptyText: { color: C.mid, fontSize: 14 },
  sessionCard: { borderRadius: 18, padding: 20, marginBottom: 20 },
  sessionName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 14 },
  sessionMeta: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  startBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  nutritionRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutContainer: { width: 96, height: 96, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutPct: { fontSize: 18, fontWeight: '800', color: C.text },
  donutSub: { fontSize: 10, color: C.mid },
  macros: { flex: 1, gap: 10 },
  macroRow: { gap: 4 },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel: { fontSize: 12, color: C.mid },
  macroValue: { fontSize: 12, color: C.text, fontWeight: '600' },
  macroBar: { height: 4, backgroundColor: C.border, borderRadius: 2 },
  macroBarFill: { height: 4, borderRadius: 2 },
  progressCard: {},
  weightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weightBig: { fontSize: 32, fontWeight: '800', color: C.text },
  weightUnit: { fontSize: 18, fontWeight: '500', color: C.mid },
  calendarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.blueBg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  calendarBtnText: { color: C.blue, fontWeight: '600', fontSize: 13 },
});
