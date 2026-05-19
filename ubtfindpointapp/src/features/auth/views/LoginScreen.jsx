import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthViewModel } from '../viewmodel/AuthViewModel';

const LOGO_SIZE = Math.min(Dimensions.get('window').width * 0.34, 150);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    let hasError = false;

    setEmailError('');
    setPasswordError('');
    setAuthError('');

    if (!trimmedEmail) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!trimmedPassword) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      await login(trimmedEmail, trimmedPassword);
      router.replace('/home');
    } catch (error) {
      const message = (error?.response?.data?.error || error?.message || 'Please try again.').trim();
      const loweredMessage = message.toLowerCase();

      if (loweredMessage.includes('user not found')) {
        setEmailError('User does not exist.');
      } else if (loweredMessage.includes('invalid password')) {
        setPasswordError('Password is incorrect.');
      } else {
        setAuthError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
      <KeyboardAvoidingView style={styles.keyboardWrapper} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.logoShell}>
              <View style={styles.glowOrb} />
              <Image source={require('@/assets/images/fp.png')} resizeMode="contain" style={styles.logo} />
            </View>
            <Text style={styles.eyebrow}>Campus lost and found</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to manage posts, help others, and keep track of recent lost and found activity.</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatChip}>
                <Text style={styles.heroStatValue}>Fast</Text>
                <Text style={styles.heroStatLabel}>reporting</Text>
              </View>
              <View style={styles.heroStatChip}>
                <Text style={styles.heroStatValue}>Safe</Text>
                <Text style={styles.heroStatLabel}>community</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailError('');
                setAuthError('');
              }}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, emailError ? styles.inputError : null]}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError('');
                setAuthError('');
              }}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, passwordError ? styles.inputError : null]}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.88}>
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.8}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4f8',
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoShell: {
    width: LOGO_SIZE + 32,
    height: LOGO_SIZE + 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d8e6f2',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    marginBottom: 18,
  },
  glowOrb: {
    position: 'absolute',
    width: LOGO_SIZE + 90,
    height: LOGO_SIZE + 90,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    opacity: 0.55,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: '800',
    color: '#10233f',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#526175',
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroStatChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    alignItems: 'center',
    minWidth: 92,
  },
  heroStatValue: {
    color: '#10233f',
    fontSize: 13,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#f7fbff',
    marginBottom: 12,
    fontSize: 15,
    color: '#10233f',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
  },
  button: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    marginTop: 10,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    color: '#526175',
    fontSize: 14,
  },
  registerLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
});
