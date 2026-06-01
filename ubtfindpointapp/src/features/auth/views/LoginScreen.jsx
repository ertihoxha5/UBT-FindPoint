import React, { useState, useRef } from 'react';
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
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthViewModel } from '../viewmodel/AuthViewModel';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGO_SIZE = Math.min(width * 0.45, 180);

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  
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

  const handleLogin = async () => {
    Keyboard.dismiss();
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

    if (hasError) return;

    setLoading(true);

    try {
      const result = await login(trimmedEmail, trimmedPassword);
      router.replace(result?.user?.role === 'admin' ? '/admin' : '/home');
    } catch (error) {
      const message = (error?.response?.data?.error || error?.message || 'Please try again.').trim();
      const loweredMessage = message.toLowerCase();

      if (loweredMessage.includes('user not found')) {
        setEmailError('User does not exist.');
      } else if (loweredMessage.includes('invalid password')) {
        setPasswordError('Password is incorrect.');
      } else if (loweredMessage.includes('blocked')) {
        setAuthError('This account has been blocked by an administrator.');
      } else {
        setAuthError(message);
      }
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
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.heroSection}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.logoBackground}>
                    <View style={styles.glowEffect} />
                    <Image 
                      source={require('@/assets/images/fp.png')} 
                      resizeMode="contain" 
                      style={styles.logo} 
                    />
                  </View>
                </Animated.View>
                
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to manage posts, help others, and keep track of recent lost and found activity
                </Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                    <Ionicons name="mail-outline" size={20} color="#4a90e2" style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setEmailError('');
                        setAuthError('');
                      }}
                      placeholder="Email"
                      placeholderTextColor="#aaa"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                  {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#4a90e2" style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setPasswordError('');
                        setAuthError('');
                      }}
                      placeholder="Password"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#aaa" 
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                </View>

                <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/forgot-password')}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {authError && (
                  <View style={styles.authErrorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text style={styles.authErrorText}>{authError}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                  onPress={handleLogin} 
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                    <Text style={styles.registerLink}>Register</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '500',
  },
  authErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  authErrorText: {
    color: '#e74c3c',
    fontSize: 13,
    flex: 1,
  },
  loginButton: {
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
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#6c8db0',
    fontSize: 14,
  },
  registerLink: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '700',
  },
});