import React, { useState } from 'react';
import {ActivityIndicator,KeyboardAvoidingView,Dimensions,Image,Platform,StyleSheet,Text,TextInput,
	TouchableOpacity,
	ScrollView,
	View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthViewModel } from '../viewmodel/AuthViewModel';

const LOGO_SIZE = Math.min(Dimensions.get('window').width * 0.52, 220);
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
			router.replace('/lostItems');
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
			<StatusBar style="dark" backgroundColor="#eef2ff" translucent={false} />
			<KeyboardAvoidingView
				style={styles.keyboardWrapper}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.formPanel}>
						<View style={styles.headerWrap}>
							<Image
								source={require('@/assets/images/fp.png')}
								resizeMode="contain"
								style={styles.logo}
							/>
							<Text style={styles.title}>Login</Text>
						</View>

						<TextInput
							value={email}
							onChangeText={(value) => {
								setEmail(value);
								if (emailError) {
									setEmailError('');
								}
								if (authError) {
									setAuthError('');
								}
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
								if (passwordError) {
									setPasswordError('');
								}
								if (authError) {
									setAuthError('');
								}
							}}
							placeholder="Password"
							placeholderTextColor="#94a3b8"
							secureTextEntry
							autoCapitalize="none"
							style={[styles.input, passwordError ? styles.inputError : null]}
						/>
						{passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
						{authError ? <Text style={styles.errorText}>{authError}</Text> : null}

						<View style={styles.linksRow}>
							<TouchableOpacity onPress={() => router.push('/forgot-password')} activeOpacity={0.8}>
								<Text style={styles.linkText}>Forgot password?</Text>
							</TouchableOpacity>

						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleLogin}
							disabled={loading}
							activeOpacity={0.85}
						>
							{loading ? (
								<ActivityIndicator color="#ffffff" />
							) : (
								<Text style={styles.buttonText}>Login</Text>
							)}
						</TouchableOpacity>

						<View style={styles.registerRow}>
							<Text style={styles.registerText}>Don't have an account? </Text>
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
		backgroundColor: '#eef2ff',
	},
	keyboardWrapper: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	formPanel: {
		flex: 1,
		backgroundColor: '#eef2ff',
		paddingHorizontal: 24,
		paddingTop: 32,
		paddingBottom: 32,
		justifyContent: 'center',
	},
	headerWrap: {
		alignItems: 'center',
		marginBottom: 20,
	},
	logo: {
		width: LOGO_SIZE,
		height: LOGO_SIZE,
		alignSelf: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#0e2f77',
		marginBottom: 4,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 15,
		color: '#475569',
		marginBottom: 14,
		textAlign: 'center',
	},
	input: {
		height: 52,
		borderWidth: 1,
		borderColor: '#dbe4f0',
		borderRadius: 14,
		paddingHorizontal: 16,
		backgroundColor: '#ffffff',
		marginBottom: 12,
		fontSize: 15,
		color: '#0f172a',
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
	hintText: {
		color: '#64748b',
		fontSize: 13,
		marginTop: 2,
		marginBottom: 10,
	},
	linksRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	linkText: {
		color: '#2563eb',
		fontSize: 14,
		fontWeight: '600',
	},
	button: {
		height: 52,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#2563eb',
		marginTop: 10,
		shadowColor: '#1d4ed8',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.25,
		shadowRadius: 14,
		elevation: 6,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
	},
	registerRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 16,
	},
	registerText: {
		color: '#475569',
		fontSize: 14,
	},
	registerLink: {
		color: '#2563eb',
		fontSize: 14,
		fontWeight: '700',
	},
});
