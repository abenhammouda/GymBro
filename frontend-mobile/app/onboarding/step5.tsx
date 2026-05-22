import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Step5() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={['#2B59C4', '#3A6FE8', '#4D80F0']} style={styles.container}>
      <View style={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.party}>
          <Text style={styles.partyEmoji}>🎉</Text>
        </View>

        <View style={styles.main}>
          <Text style={styles.title}>C'est parti, Melissa !</Text>
          <Text style={styles.subtitle}>
            Alex a été notifié. Tu recevras ton premier programme dans les 24 heures. En attendant, jette un œil au calendrier.
          </Text>

          <View style={styles.checklist}>
            <CheckItem done text="Profil enregistré" />
            <CheckItem done text="Objectif partagé avec ton coach" />
            <CheckItem done={false} text="Première séance · à valider par Alex" />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.btnPrimaryText}>Entrer dans l'app →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/onboarding/step1')}>
            <Text style={styles.resetText}>(reset démo)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

function CheckItem({ done, text }: { done: boolean; text: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
        {done && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.checkText, !done && styles.checkTextPending]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  party: { alignItems: 'flex-end', paddingBottom: 8 },
  partyEmoji: { fontSize: 36 },
  main: { flex: 1, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginBottom: 16 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22, marginBottom: 32 },
  checklist: { gap: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: '#34C759', borderColor: '#34C759' },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 12 },
  checkText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  checkTextPending: { color: 'rgba(255,255,255,0.6)' },
  actions: { gap: 16 },
  btnPrimary: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#3A6FE8', fontWeight: '700', fontSize: 16 },
  resetText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: 13 },
});
