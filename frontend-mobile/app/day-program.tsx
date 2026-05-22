import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { getWorkoutByDate, getMealsByDate } from '../services/schedule.service';
import { getCurrentMacroPlan } from '../services/macros.service';
import type { ScheduledWorkoutResponse, ScheduledMealResponse, MacroPlanDto } from '../types/api.types';

const MEAL_ICONS = ['🌅', '🍽️', '🥕', '🌙', '🥗'];

export default function DayProgram() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, coachClientId } = useAuth();
  const { date } = useLocalSearchParams<{ date?: string }>();

  const targetDate = date ? new Date(date) : new Date();
  const dateLabel = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });

  const [workout, setWorkout] = useState<ScheduledWorkoutResponse | null>(null);
  const [meals, setMeals] = useState<ScheduledMealResponse[]>([]);
  const [macros, setMacros] = useState<MacroPlanDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !coachClientId) return;
    setLoading(true);
    Promise.all([
      getWorkoutByDate(user.userId, targetDate),
      getMealsByDate(user.userId, targetDate),
      getCurrentMacroPlan(coachClientId),
    ]).then(([w, m, mac]) => {
      setWorkout(w);
      setMeals(m);
      setMacros(mac);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, coachClientId, date]);

  const kcalDone = meals.reduce((s, m) => s + (m.meal?.totalCalories ?? 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={C.blue} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>PROGRAMME DU JOUR</Text>
          <Text style={styles.headerTitle}>{dateLabel}</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.blue} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Workout section */}
          {workout ? (
            <>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionBadge}><Text style={styles.sessionBadgeText}>SÉANCE</Text></View>
                <View style={styles.sessionRow}>
                  <View>
                    <Text style={styles.sessionName}>{workout.workoutSession?.name ?? 'Séance'}</Text>
                    <Text style={styles.sessionMeta}>
                      {workout.workoutSession?.exercises?.length ?? 0} exercices · {workout.workoutSession?.duration ?? 0} min
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.playBtn}
                    onPress={() => router.push({ pathname: '/workout', params: { scheduledId: workout.scheduledWorkoutSessionId } })}
                  >
                    <Ionicons name="play" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.exerciseList}>
                {(workout.workoutSession?.exercises ?? []).map((ex, i) => (
                  <View key={i} style={[styles.exerciseRow, i === (workout.workoutSession?.exercises?.length ?? 0) - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.exNum}><Text style={styles.exNumText}>{i + 1}</Text></View>
                    <View style={styles.exInfo}>
                      <Text style={styles.exName}>{ex.exerciseName}</Text>
                      <Text style={styles.exDetail}>{ex.sets}×{ex.reps} · {ex.restSeconds}s repos</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
              <Ionicons name="barbell-outline" size={28} color={C.light} />
              <Text style={{ color: C.mid, marginTop: 8 }}>Pas de séance ce jour</Text>
            </View>
          )}

          {/* Meals section */}
          {meals.length > 0 && (
            <>
              <View style={styles.mealSection}>
                <View style={styles.mealSectionHeader}>
                  <Text style={styles.mealSectionTitle}>REPAS DU JOUR</Text>
                  <View style={styles.macroRow}>
                    <Text style={[styles.macroTag, { color: C.blue }]}>P {macros?.proteinGrams ?? 0}g</Text>
                    <Text style={[styles.macroTag, { color: C.orange }]}>G {macros?.carbsGrams ?? 0}g</Text>
                    <Text style={[styles.macroTag, { color: C.red }]}>L {macros?.fatGrams ?? 0}g</Text>
                  </View>
                </View>
                <View style={styles.kcalRow}>
                  <Text style={styles.kcalBig}>{Math.round(kcalDone)}</Text>
                  <Text style={styles.kcalTarget}> / {macros?.calories ?? 1800} kcal</Text>
                </View>
              </View>

              {meals.map((meal, i) => (
                <View key={meal.scheduledMealId} style={styles.mealRow}>
                  <Text style={styles.mealIcon}>{MEAL_ICONS[i % MEAL_ICONS.length]}</Text>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.meal?.name ?? 'Repas'} · {meal.scheduledTime?.slice(0, 5) ?? ''}</Text>
                    <Text style={styles.mealDetail}>
                      P {Math.round(meal.meal?.totalProteins ?? 0)}g · G {Math.round(meal.meal?.totalCarbs ?? 0)}g · L {Math.round(meal.meal?.totalFats ?? 0)}g
                    </Text>
                  </View>
                  <Text style={styles.mealKcal}>{Math.round(meal.meal?.totalCalories ?? 0)}<Text style={styles.kcalUnit}>{'\n'}kcal</Text></Text>
                </View>
              ))}
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {workout && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push({ pathname: '/workout', params: { scheduledId: workout.scheduledWorkoutSessionId } })}
          >
            <Text style={styles.startBtnText}>Démarrer la séance →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginLeft: 4 },
  headerLabel: { fontSize: 10, color: C.mid, fontWeight: '600', letterSpacing: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  content: { padding: 16 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, ...shadow, marginBottom: 12 },
  sessionHeader: { backgroundColor: C.blue, borderRadius: 16, padding: 16, marginBottom: 2 },
  sessionBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  sessionBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sessionMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  exerciseList: { backgroundColor: C.white, borderRadius: 16, marginTop: 12, overflow: 'hidden', ...shadow, marginBottom: 20 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: C.border, gap: 12 },
  exNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontSize: 12, fontWeight: '700', color: C.mid },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, fontWeight: '600', color: C.text },
  exDetail: { fontSize: 12, color: C.mid, marginTop: 2 },
  mealSection: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginTop: 4, ...shadow },
  mealSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mealSectionTitle: { fontSize: 11, fontWeight: '700', color: C.mid, letterSpacing: 0.8 },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroTag: { fontSize: 12, fontWeight: '700' },
  kcalRow: { flexDirection: 'row', alignItems: 'baseline' },
  kcalBig: { fontSize: 28, fontWeight: '800', color: C.text },
  kcalTarget: { fontSize: 14, color: C.mid },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: C.border },
  mealIcon: { fontSize: 20 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 13, fontWeight: '600', color: C.text },
  mealDetail: { fontSize: 12, color: C.mid, marginTop: 2 },
  mealKcal: { fontSize: 14, fontWeight: '700', color: C.text, textAlign: 'right' },
  kcalUnit: { fontSize: 10, fontWeight: '400', color: C.mid },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: C.white, borderTopWidth: 1, borderColor: C.border },
  startBtn: { backgroundColor: C.blue, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
