import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, shadow } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { submitWeeklyProgress } from '../services/progress.service';
import { getWeeklyProgress } from '../services/progress.service';

const MOODS = [
  { id: 'hard', emoji: '😣', label: 'Difficile' },
  { id: 'binge', emoji: '😐', label: 'Bingé' },
  { id: 'ok', emoji: '🙂', label: 'Correct' },
  { id: 'good', emoji: '😊', label: 'Bien' },
  { id: 'great', emoji: '🔥', label: 'Excellent' },
];

export default function WeeklyCheckin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { coachClientId } = useAuth();

  const [weight, setWeight] = useState(70.0);
  const [mood, setMood] = useState('good');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!coachClientId) {
      Alert.alert('Erreur', 'Impossible de trouver ton profil coach.');
      return;
    }
    setSubmitting(true);
    try {
      const existing = await getWeeklyProgress(coachClientId);
      const weekNumber = (existing.length > 0 ? Math.max(...existing.map(p => p.weekNumber)) : 0) + 1;
      await submitWeeklyProgress({
        coachClientId,
        weekNumber,
        currentWeight: weight,
        notes: mood,
      });
      Alert.alert('Bilan envoyé !', 'Ton coach a été notifié.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/progression') },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible d\'envoyer le bilan.');
    }
    setSubmitting(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.mid} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>BILAN HEBDO</Text>
          <Text style={styles.headerTitle}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>Comment s'est passée ta semaine ?</Text>
        <Text style={styles.mainSub}>Ça prend 2 min. Alex utilise ces données pour ajuster la prochaine semaine.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Poids du jour</Text>
          <View style={styles.weightRow}>
            <TouchableOpacity style={styles.weightBtn} onPress={() => setWeight(w => Math.round((w - 0.1) * 10) / 10)}>
              <Ionicons name="remove" size={20} color={C.blue} />
            </TouchableOpacity>
            <View style={styles.weightCenter}>
              <Text style={styles.weightBig}>{weight.toFixed(1)} <Text style={styles.weightUnit}>kg</Text></Text>
            </View>
            <TouchableOpacity style={styles.weightBtn} onPress={() => setWeight(w => Math.round((w + 0.1) * 10) / 10)}>
              <Ionicons name="add" size={20} color={C.blue} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ton ressenti</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.moodBtn, mood === m.id && styles.moodBtnActive]}
                onPress={() => setMood(m.id)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood === m.id && styles.moodLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Envoyer à mon coach →</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.border },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerLabel: { fontSize: 10, color: C.mid, fontWeight: '600', letterSpacing: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  scroll: { flex: 1 },
  content: { padding: 16 },
  mainTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 8 },
  mainSub: { fontSize: 14, color: C.mid, lineHeight: 20, marginBottom: 20 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 14, ...shadow },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },
  weightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weightBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  weightCenter: { alignItems: 'center' },
  weightBig: { fontSize: 36, fontWeight: '800', color: C.text },
  weightUnit: { fontSize: 20, fontWeight: '500', color: C.mid },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', flex: 1, gap: 4 },
  moodBtnActive: { borderColor: C.blue, backgroundColor: C.blueBg },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, color: C.mid, textAlign: 'center' },
  moodLabelActive: { color: C.blue, fontWeight: '600' },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: C.white, borderTopWidth: 1, borderColor: C.border },
  submitBtn: { backgroundColor: C.blue, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { fontWeight: '700', fontSize: 16, color: '#fff' },
});
