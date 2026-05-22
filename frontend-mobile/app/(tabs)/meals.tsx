import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { C, shadow } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getTodayMeals } from '../../services/schedule.service';
import { getCurrentMacroPlan } from '../../services/macros.service';
import type { ScheduledMealResponse, MacroPlanDto } from '../../types/api.types';

const MEAL_ICONS = ['🌅', '🍽️', '🥕', '🌙', '🥗', '🍎'];
const R = 44, STROKE = 9, CIRC = 2 * Math.PI * R;

export default function MealsTab() {
  const insets = useSafeAreaInsets();
  const { user, coachClientId } = useAuth();

  const [meals, setMeals] = useState<ScheduledMealResponse[]>([]);
  const [macros, setMacros] = useState<MacroPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!user || !coachClientId) return;
    if (!silent) setLoading(true);
    try {
      const [m, mac] = await Promise.all([
        getTodayMeals(user.userId),
        getCurrentMacroPlan(coachClientId),
      ]);
      setMeals(m);
      setMacros(mac);
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

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase();

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
          <Text style={styles.headerSub}>Plan nutritionnel</Text>
          <Text style={styles.headerTitle}>Mes repas</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.blue} />}
      >
        <View style={styles.card}>
          <Text style={styles.dayLabel}>AUJOURD'HUI · {today}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.donutWrap}>
              <Svg width={100} height={100}>
                <Circle cx={50} cy={50} r={R} fill="none" stroke={C.border} strokeWidth={STROKE} />
                <Circle cx={50} cy={50} r={R} fill="none" stroke={C.blue} strokeWidth={STROKE}
                  strokeDasharray={`${filled} ${CIRC - filled}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
              </Svg>
              <View style={styles.donutCenter}><Text style={styles.donutPct}>{pct}%</Text></View>
            </View>
            <View style={styles.kcalRight}>
              <Text style={styles.kcalBig}>{Math.round(kcalDone)}</Text>
              <Text style={styles.kcalSub}>/ {kcalTarget} kcal</Text>
              <View style={styles.macrosCol}>
                <MacroLine label="Protéines" done={proteinDone} target={macros?.proteinGrams ?? 130} color={C.blue} />
                <MacroLine label="Glucides" done={carbsDone} target={macros?.carbsGrams ?? 180} color={C.orange} />
                <MacroLine label="Lipides" done={fatDone} target={macros?.fatGrams ?? 55} color={C.red} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Repas planifiés</Text>

        {meals.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
            <Ionicons name="restaurant-outline" size={28} color={C.light} />
            <Text style={[styles.kcalSub, { marginTop: 8 }]}>Pas de repas planifié aujourd'hui</Text>
          </View>
        ) : (
          meals.map((meal, i) => (
            <View key={meal.scheduledMealId} style={styles.mealCard}>
              <View style={styles.mealLeft}>
                <Text style={styles.mealIcon}>{MEAL_ICONS[i % MEAL_ICONS.length]}</Text>
              </View>
              <View style={styles.mealMid}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealName}>{meal.meal?.name ?? 'Repas'}</Text>
                  <Text style={styles.mealTime}>{meal.scheduledTime?.slice(0, 5) ?? ''}</Text>
                </View>
                <Text style={styles.mealMacros}>
                  P {Math.round(meal.meal?.totalProteins ?? 0)}g · G {Math.round(meal.meal?.totalCarbs ?? 0)}g · L {Math.round(meal.meal?.totalFats ?? 0)}g
                </Text>
              </View>
              <Text style={styles.mealKcal}>{Math.round(meal.meal?.totalCalories ?? 0)}<Text style={styles.kcalUnit}>{'\n'}kcal</Text></Text>
            </View>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function MacroLine({ label, done, target, color }: { label: string; done: number; target: number; color: string }) {
  return (
    <View style={styles.macroLine}>
      <View style={[styles.macroColorDot, { backgroundColor: color }]} />
      <Text style={styles.macroLineLabel}>{label}</Text>
      <Text style={styles.macroLineVal}>{Math.round(done)}<Text style={styles.macroLineTarget}>/{target}g</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  headerSub: { fontSize: 12, color: C.mid, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  content: { padding: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 20, ...shadow },
  dayLabel: { fontSize: 11, fontWeight: '600', color: C.mid, letterSpacing: 0.8, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutPct: { fontSize: 18, fontWeight: '800', color: C.text },
  kcalRight: { flex: 1 },
  kcalBig: { fontSize: 32, fontWeight: '800', color: C.text },
  kcalSub: { fontSize: 13, color: C.mid, marginBottom: 12 },
  macrosCol: { gap: 6 },
  macroLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  macroColorDot: { width: 6, height: 6, borderRadius: 3 },
  macroLineLabel: { flex: 1, fontSize: 12, color: C.mid },
  macroLineVal: { fontSize: 12, fontWeight: '700', color: C.text },
  macroLineTarget: { fontWeight: '400', color: C.mid },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
  mealCard: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow },
  mealLeft: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  mealIcon: { fontSize: 22 },
  mealMid: { flex: 1 },
  mealTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealName: { fontSize: 14, fontWeight: '700', color: C.text },
  mealTime: { fontSize: 12, color: C.mid },
  mealMacros: { fontSize: 11, color: C.light, marginTop: 3 },
  mealKcal: { fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'right' },
  kcalUnit: { fontSize: 10, fontWeight: '400', color: C.mid },
});
