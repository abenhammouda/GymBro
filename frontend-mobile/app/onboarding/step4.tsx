import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../constants/Colors';

export default function Step4() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ProgressBar step={3} total={4} />
      <View style={styles.content}>
        <Text style={styles.stepLabel}>3 / 4 · PHOTOS D'AVANT</Text>
        <Text style={styles.title}>3 photos pour suivre tes progrès</Text>
        <Text style={styles.subtitle}>Ces photos sont privées et visibles uniquement par ton coach. Tu en feras de nouvelles chaque semaine.</Text>

        <View style={styles.photoRow}>
          {['FACE', 'PROFIL', 'DOS'].map(label => (
            <TouchableOpacity key={label} style={styles.photoZone}>
              <Ionicons name="camera-outline" size={28} color={C.light} />
              <Text style={styles.photoLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={C.blue} />
          <Text style={styles.infoText}>
            Tiens-toi droite, en sous vêtements ou tenue de sport ajustée, contre un mur clair. Les détails comptent moins que la régularité.
          </Text>
        </View>
      </View>

      <View style={[styles.nav, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <Text style={styles.navBackText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navSkip} onPress={() => router.push('/onboarding/step5')}>
          <Text style={styles.navSkipText}>Faire plus tard →</Text>
        </TouchableOpacity>
      </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  progressSeg: { flex: 1, height: 3, backgroundColor: C.border, borderRadius: 2 },
  progressSegActive: { backgroundColor: C.blue },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  stepLabel: { color: C.light, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.mid, lineHeight: 20, marginBottom: 32 },
  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  photoZone: {
    flex: 1, aspectRatio: 0.75,
    borderWidth: 2, borderColor: C.border, borderRadius: 14,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  photoLabel: { fontSize: 11, fontWeight: '600', color: C.light, letterSpacing: 0.8 },
  infoBox: {
    flexDirection: 'row', gap: 8, backgroundColor: C.blueBg,
    borderRadius: 10, padding: 14,
  },
  infoText: { flex: 1, fontSize: 12, color: C.blue, lineHeight: 18 },
  nav: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 12, gap: 12, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.white },
  navBack: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: C.border },
  navBackText: { fontSize: 22, color: C.mid },
  navSkip: { flex: 1, backgroundColor: C.blue, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 52 },
  navSkipText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
