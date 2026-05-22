import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Polyline, Circle as SvgCircle, Text as SvgText } from 'react-native-svg';
import { C, shadow } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getWeightHistory, getWeeklyProgress } from '../../services/progress.service';

export default function ProgressionTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { coachClientId } = useAuth();

  const [history, setHistory] = useState<{ label: string; weight: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!coachClientId) return;
    if (!silent) setLoading(true);
    try {
      const h = await getWeightHistory(coachClientId);
      setHistory(h);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [coachClientId]);

  const currentWeight = history.length ? history[history.length - 1].weight : null;
  const startWeight = history.length ? history[0].weight : null;
  const delta = currentWeight != null && startWeight != null ? currentWeight - startWeight : null;

  const W = 280, H = 100;
  const weights = history.map(h => h.weight);
  const minVal = weights.length ? Math.min(...weights) - 1 : 65;
  const maxVal = weights.length ? Math.max(...weights) + 1 : 75;

  const pts = history.map((h, i) => {
    const x = history.length > 1 ? (i / (history.length - 1)) * W : W / 2;
    const y = H - ((h.weight - minVal) / (maxVal - minVal)) * H;
    return { x, y, w: h.weight, label: h.label };
  });
  const polyPoints = pts.map(p => `${p.x},${p.y}`).join(' ');

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
        <Text style={styles.headerSub}>Mon suivi</Text>
        <Text style={styles.headerTitle}>Progression</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.blue} />}
      >
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>POIDS · {history.length} SEMAINES</Text>
            {delta != null && (
              <Text style={[styles.chartDelta, { color: delta <= 0 ? C.green : C.red }]}>
                {delta > 0 ? '+' : '↓ '}{Math.abs(delta).toFixed(1)} kg
              </Text>
            )}
          </View>
          {pts.length >= 2 ? (
            <View style={styles.chartWrap}>
              <Svg width={W} height={H + 20}>
                <Polyline points={polyPoints} fill="none" stroke={C.blue} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                {pts.map((p, i) => (
                  <SvgCircle key={i} cx={p.x} cy={p.y} r={4} fill={i === pts.length - 1 ? C.blue : C.white} stroke={C.blue} strokeWidth={2} />
                ))}
                {pts.map((p, i) => (
                  <SvgText key={i} x={p.x} y={H + 16} fontSize={9} fill={C.light} textAnchor="middle">{p.label}</SvgText>
                ))}
              </Svg>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>Pas encore assez de données</Text>
            </View>
          )}
          {currentWeight != null && (
            <View style={styles.weightRow}>
              <Text style={styles.currentWeight}>{currentWeight.toFixed(1)} kg</Text>
              {delta != null && <Text style={[styles.weightDelta, { color: delta <= 0 ? C.green : C.red }]}>{delta > 0 ? '+' : '↓ '}{Math.abs(delta).toFixed(1)} kg depuis le début</Text>}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.checkInCard} onPress={() => router.push('/weekly-checkin')}>
          <View style={styles.checkInLeft}>
            <Text style={styles.checkInTitle}>Bilan hebdomadaire</Text>
            <Text style={styles.checkInDetail}>Pesée + photos · 3 min · Dimanche</Text>
          </View>
          <View style={styles.checkInBadge}>
            <Text style={styles.checkInBadgeText}>Faire maintenant</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  headerSub: { fontSize: 12, color: C.mid, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  content: { padding: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, ...shadow },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartLabel: { fontSize: 11, fontWeight: '600', color: C.mid, letterSpacing: 0.8 },
  chartDelta: { fontSize: 13, fontWeight: '700' },
  chartWrap: { alignItems: 'center' },
  emptyChart: { height: 80, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: C.light, fontSize: 13 },
  weightRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  currentWeight: { fontSize: 28, fontWeight: '800', color: C.text },
  weightDelta: { fontSize: 13 },
  checkInCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, ...shadow, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkInLeft: { flex: 1 },
  checkInTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  checkInDetail: { fontSize: 12, color: C.mid, marginTop: 4 },
  checkInBadge: { backgroundColor: C.blueBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  checkInBadgeText: { color: C.blue, fontWeight: '700', fontSize: 12 },
});
