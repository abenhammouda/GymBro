import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Step1() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={['#2B59C4', '#3A6FE8', '#4D80F0']} style={styles.container}>
      <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.label}>COACHFLOW · INVITATION</Text>

        <View style={styles.main}>
          <Text style={styles.title}>Bienvenue Melissa,{'\n'}ton coach t'attend 👋</Text>
          <Text style={styles.subtitle}>
            Alex Bennani t'a invitée à rejoindre son programme. On a juste besoin de quelques infos pour démarrer (~3 minutes).
          </Text>

          <View style={styles.coachCard}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachInitials}>AB</Text>
            </View>
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>Alex Bennani</Text>
              <Text style={styles.coachSub}>Coach certifié · 6 ans d'expérience</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Vérifié</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/onboarding/step2')}>
            <Text style={styles.btnPrimaryText}>Commencer →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.linkText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 1.2, marginBottom: 40 },
  main: { flex: 1, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 36, marginBottom: 16 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22, marginBottom: 32 },
  coachCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  coachInitials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  coachInfo: { flex: 1 },
  coachName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  coachSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  badge: {
    backgroundColor: 'rgba(52,199,89,0.25)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { color: '#34C759', fontSize: 12, fontWeight: '600' },
  actions: { gap: 16 },
  btnPrimary: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#3A6FE8', fontWeight: '700', fontSize: 16 },
  linkText: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 14 },
});
