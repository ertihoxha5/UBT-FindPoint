import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const LOGO_SIZE = Math.min(Dimensions.get('window').width * 0.3, 130);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthViewModel();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleRegister = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    let hasError = false;

    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!trimmedName) {
      setFullNameError('Full name is required.');
      hasError = true;
    }

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
    } else if (!STRONG_PASSWORD_REGEX.test(trimmedPassword)) {
      setPasswordError(STRONG_PASSWORD_MESSAGE);
      hasError = true;
    }

    if (!trimmedConfirmPassword) {
      setConfirmPasswordError('Confirm password is required.');
      hasError = true;
    } else if (trimmedPassword !== trimmedConfirmPassword) {
      setConfirmPasswordError('Password and confirm password must match.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      await register(trimmedName, trimmedEmail, trimmedPassword);
      Alert.alert('Account created', `Welcome, ${trimmedName}!`);
      router.replace('/login');
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Please try again.';
      Alert.alert('Registration failed', message);
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
            <Text style={styles.eyebrow}>Join FindPoint</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join the campus community and help return lost items to the right people faster.</Text>
            <View style={styles.heroPills}>
              <Text style={styles.heroPill}>Lost reports</Text>
              <Text style={styles.heroPill}>Found reports</Text>
              <Text style={styles.heroPill}>Direct chat</Text>
            </View>
          </View>

          <View style={styles.card}>
            <TextInput
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                setFullNameError('');
              }}
              placeholder="Full name"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              autoCorrect={false}
              style={[styles.input, fullNameError ? styles.inputError : null]}
            />
            {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}

            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailError('');
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
              }}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, passwordError ? styles.inputError : null]}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <TextInput
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setConfirmPasswordError('');
              }}
              placeholder="Confirm password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, confirmPasswordError ? styles.inputError : null]}
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.88}>
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.8}>
                <Text style={styles.loginLink}>Login</Text>
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
    width: LOGO_SIZE + 34,
    height: LOGO_SIZE + 34,
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
    width: LOGO_SIZE + 86,
    height: LOGO_SIZE + 86,
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
    fontSize: 33,
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
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  heroPill: {
    color: '#1e40af',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#526175',
    fontSize: 14,
  },
  loginLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
});
