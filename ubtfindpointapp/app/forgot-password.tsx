import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthViewModel } from '@/src/features/auth/viewmodel/AuthViewModel';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.45, 180);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset } = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUpdatePassword = async () => {
    Keyboard.dismiss();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    let hasError = false;

    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!trimmedEmail) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!trimmedPassword) {
      setPasswordError('New password is required.');
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
      await requestPasswordReset(trimmedEmail, trimmedPassword, trimmedConfirmPassword);
      Alert.alert('Password updated', 'Your password has been changed successfully.', [
        { text: 'Back to login', onPress: () => router.replace('/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Update failed', error?.response?.data?.error || error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
        <KeyboardAvoidingView
          style={styles.keyboardWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.heroSection}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.logoBackground}>
                    <View style={styles.glowEffect} />
                    <Image source={require('@/assets/images/fp.png')} resizeMode="contain" style={styles.logo} />
                  </View>
                </Animated.View>

                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.subtitle}>
                  Create a strong new password for your account and continue using FindPoint.
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                    <Ionicons name="mail-outline" size={20} color="#4a90e2" style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setEmailError('');
                      }}
                      placeholder="Email"
                      placeholderTextColor="#aaa"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#4a90e2" style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setPasswordError('');
                      }}
                      placeholder="New password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#aaa" />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, confirmPasswordError && styles.inputContainerError]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#4a90e2" style={styles.inputIcon} />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        setConfirmPasswordError('');
                      }}
                      placeholder="Confirm password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#aaa" />
                    </TouchableOpacity>
                  </View>
                  {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                  onPress={handleUpdatePassword}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Update Password</Text>}
                </TouchableOpacity>

                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>Remembered your password? </Text>
                  <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoBackground: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: LOGO_SIZE + 20,
    height: LOGO_SIZE + 20,
    borderRadius: (LOGO_SIZE + 20) / 2,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  logo: {
    width: LOGO_SIZE * 0.7,
    height: LOGO_SIZE * 0.7,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c8db0',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 56,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a3a5c',
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#6c8db0',
    fontSize: 14,
  },
  loginLink: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '700',
  },
});
