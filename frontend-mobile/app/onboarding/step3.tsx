import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/Colors';

const GOALS = [
  { id: 'loss', emoji: '🔥', title: 'Perte de poids', sub: 'Brûler du gras, garder le muscle' },
  { id: 'gain', emoji: '💪', title: 'Prise de masse', sub: 'Construire du muscle progressivement' },
  { id: 'maintain', emoji: '⚖️', title: 'Maintien', sub: 'Stabiliser son poids actuel' },
  { id: 'endurance', emoji: '🏃', title: 'Endurance', sub: 'Améliorer cardio et résistance' },
  { id: 'flexibility', emoji: '🤸', title: 'Flexibilité', sub: 'Mobilité, souplesse, récupération' },
];

export default function Step3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('loss');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ProgressBar step={2} total={4} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>2 / 4 · TON OBJECTIF</Text>
        <Text style={styles.title}>Quel est ton but principal ?</Text>
        <Text style={styles.subtitle}>Choisis l'objectif qui te correspond le mieux aujourd'hui. Ton coach pourra l'ajuster avec toi.</Text>

        <View style={styles.goals}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalCard, selected === g.id && styles.goalCardActive]}
              onPress={() => setSelected(g.id)}
            >
              <Text style={styles.goalEmoji}>{g.emoji}</Text>
              <View style={styles.goalText}>
                <Text style={[styles.goalTitle, selected === g.id && styles.goalTitleActive]}>{g.title}</Text>
                <Text style={styles.goalSub}>{g.sub}</Text>
              </View>
              {selected === g.id && (
                <View style={styles.check}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <NavBar onBack={() => router.back()} onNext={() => router.push('/onboarding/step4')} insets={insets} />
    </View>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.progressSeg, i < step && styles.progressSegActive]} />
      ))}
    </View>
  );
}

function NavBar({ onBack, onNext, insets }: { onBack: () => void; onNext: () => void; insets: any }) {
  return (
    <View style={[styles.nav, { paddingBottom: insets.bottom + 16 }]}>
      <TouchableOpacity style={styles.navBack} onPress={onBack}>
        <Text style={styles.navBackText}>‹</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navNext} onPress={onNext}>
        <Text style={styles.navNextText}>Continuer →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  progressSeg: { flex: 1, height: 3, backgroundColor: C.border, borderRadius: 2 },
  progressSegActive: { backgroundColor: C.blue },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  stepLabel: { color: C.light, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.mid, lineHeight: 20, marginBottom: 24 },
  goals: { gap: 10 },
  goalCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border, borderRadius: 14,
    padding: 16, backgroundColor: C.white,
  },
  goalCardActive: { borderColor: C.blue, backgroundColor: C.blueBg },
  goalEmoji: { fontSize: 26, marginRight: 14 },
  goalText: { flex: 1 },
  goalTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  goalTitleActive: { color: C.blue },
  goalSub: { fontSize: 12, color: C.mid, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 14 },
  nav: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 12, gap: 12, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.white },
  navBack: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: C.border },
  navBackText: { fontSize: 22, color: C.mid },
  navNext: { flex: 1, backgroundColor: C.blue, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 52 },
  navNextText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
