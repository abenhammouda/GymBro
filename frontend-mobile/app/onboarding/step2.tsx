import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/Colors';

const ACTIVITIES = ['Sédentaire', 'Léger', 'Modéré', 'Actif', 'Très actif'];

export default function Step2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState<'F' | 'H' | 'Autre'>('F');
  const [dob, setDob] = useState('14 / 03 / 1996');
  const [height, setHeight] = useState('168');
  const [weight, setWeight] = useState('72');
  const [activity, setActivity] = useState('Sédentaire');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ProgressBar step={1} total={4} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>1 / 4 · TON PROFIL</Text>
        <Text style={styles.title}>Parle-nous un peu de toi</Text>
        <Text style={styles.subtitle}>Ces infos aident ton coach à personnaliser ton programme. Tu pourras les modifier plus tard.</Text>

        <Label text="SEXE" />
        <View style={styles.pills}>
          {(['F', 'H', 'Autre'] as const).map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.pill, gender === g && styles.pillActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Label text="DATE DE NAISSANCE" />
            <TextInput style={styles.input} value={dob} onChangeText={setDob} />
          </View>
          <View style={styles.half}>
            <Label text="TAILLE" />
            <TextInput style={styles.input} value={height + ' cm'} onChangeText={v => setHeight(v.replace(' cm', ''))} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Label text="POIDS ACTUEL" />
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
          </View>
          <View style={styles.half}>
            <Label text="NATURE DU TRAVAIL" />
            <View style={styles.select}>
              <Text style={styles.selectText}>{activity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <NavBar onBack={() => router.back()} onNext={() => router.push('/onboarding/step3')} insets={insets} />
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
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
  subtitle: { fontSize: 14, color: C.mid, lineHeight: 20, marginBottom: 28 },
  label: { fontSize: 11, fontWeight: '600', color: C.light, letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },
  pills: { flexDirection: 'row', gap: 10 },
  pill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  pillActive: { backgroundColor: C.blue, borderColor: C.blue },
  pillText: { color: C.mid, fontWeight: '600', fontSize: 14 },
  pillTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 12, marginTop: 4 },
  half: { flex: 1 },
  input: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.text, backgroundColor: C.white,
  },
  unit: { color: C.mid, fontSize: 14 },
  select: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center',
  },
  selectText: { fontSize: 15, color: C.text },
  spacer: { height: 20 },
  nav: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 12, gap: 12, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.white },
  navBack: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: C.border },
  navBackText: { fontSize: 22, color: C.mid },
  navNext: { flex: 1, backgroundColor: C.blue, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 52 },
  navNextText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
