import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../constants/Colors';

const RPE_COLORS = ['#34C759', '#34C759', '#34C759', '#34C759', '#FF9500', '#FF9500', '#FF9500', '#FF3B30', '#FF3B30', '#FF3B30'];

export default function WorkoutDone() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [rpe, setRpe] = useState(7);
  const [note, setNote] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.mid} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>SÉANCE TERMINÉE</Text>
          <Text style={styles.headerTitle}>Upper Body — Push</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={20} color={C.mid} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={36} color={C.green} />
          </View>
          <Text style={styles.successTitle}>Bravo Melissa !</Text>
          <Text style={styles.successSub}>Séance complétée en 47 min · 8/8 exos</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox value="2 880" unit="KG TOTAL LEVÉS" />
          <StatBox value="194" unit="REPS CUMULÉES" />
          <StatBox value="47 min" unit="DURÉE" />
          <StatBox value="+5%" unit="VS S01" color={C.green} />
        </View>

        <View style={styles.card}>
          <View style={styles.rpeHeader}>
            <Text style={styles.rpeTitle}>Comment c'était ?</Text>
            <View style={styles.rpeBadge}>
              <Text style={styles.rpeBadgeText}>{rpe} / 10</Text>
            </View>
          </View>
          <View style={styles.rpeRow}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.rpeBtn, rpe === val && styles.rpeBtnActive, rpe === val && { backgroundColor: RPE_COLORS[val - 1] }]}
                onPress={() => setRpe(val)}
              >
                <Text style={[styles.rpeBtnText, rpe === val && styles.rpeBtnTextActive]}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.rpeLabels}>
            <Text style={styles.rpeLabelText}>Très facile</Text>
            <Text style={styles.rpeLabelText}>Modéré</Text>
            <Text style={styles.rpeLabelText}>Maximum</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle}>Note pour Alex</Text>
            <Text style={styles.noteOptional}>Optionnel</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Ex : épaule un peu sensible sur les dips, sinon ok 👍"
            placeholderTextColor={C.light}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.sendBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.sendBtnText}>Envoyer à Alex →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatBox({ value, unit, color }: { value: string; unit: string; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginHorizontal: 8 },
  headerLabel: { fontSize: 10, color: C.mid, fontWeight: '600', letterSpacing: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  content: { padding: 16 },
  successWrap: { alignItems: 'center', paddingVertical: 28 },
  successCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.greenBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 8 },
  successSub: { fontSize: 14, color: C.mid },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: C.white, borderRadius: 14, padding: 16, alignItems: 'center', ...shadow },
  statValue: { fontSize: 22, fontWeight: '800', color: C.text },
  statUnit: { fontSize: 10, fontWeight: '600', color: C.light, letterSpacing: 0.5, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 16, ...shadow },
  rpeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  rpeTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  rpeBadge: { backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  rpeBadgeText: { fontSize: 13, fontWeight: '700', color: C.text },
  rpeRow: { flexDirection: 'row', gap: 4 },
  rpeBtn: { flex: 1, aspectRatio: 1, borderRadius: 8, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  rpeBtnActive: { transform: [{ scale: 1.1 }] },
  rpeBtnText: { fontSize: 12, fontWeight: '700', color: C.mid },
  rpeBtnTextActive: { color: '#fff' },
  rpeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  rpeLabelText: { fontSize: 10, color: C.light },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  noteTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  noteOptional: { fontSize: 12, color: C.light },
  noteInput: { backgroundColor: C.bg, borderRadius: 12, padding: 14, fontSize: 14, color: C.text, minHeight: 80, textAlignVertical: 'top' },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: C.white, borderTopWidth: 1, borderColor: C.border },
  sendBtn: { backgroundColor: C.blue, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
