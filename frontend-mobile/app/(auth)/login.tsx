import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { C } from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs manquants', 'Remplis ton email et ton mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.title ??
        'Email ou mot de passe incorrect.';
      Alert.alert('Connexion échouée', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#2B59C4', '#3A6FE8', '#4D80F0']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
          <View style={styles.top}>
            <Text style={styles.logo}>CoachFlow</Text>
            <Text style={styles.title}>Bon retour 👋</Text>
            <Text style={styles.subtitle}>Connecte-toi pour accéder à ton programme.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL / TÉLÉPHONE</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                placeholder="ton@email.com"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>MOT DE PASSE</Text>
              <View style={styles.passWrap}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 44 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={C.blue} />
                : <Text style={styles.loginBtnText}>Se connecter →</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.onboardingLink}
            onPress={() => router.push('/onboarding/step1')}
          >
            <Text style={styles.onboardingLinkText}>Première connexion ? Rejoindre un coach</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: {},
  logo: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', letterSpacing: 2, marginBottom: 24 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 22 },
  form: { gap: 20 },
  field: { gap: 8 },
  fieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#fff',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  passWrap: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14, padding: 4 },
  loginBtn: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: C.blue, fontWeight: '700', fontSize: 16 },
  onboardingLink: { alignItems: 'center' },
  onboardingLinkText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
});
