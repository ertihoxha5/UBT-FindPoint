import React, { useState } from 'react';
import {ActivityIndicator,Alert,KeyboardAvoidingView,Dimensions,Image,Platform,StyleSheet,Text,TextInput,TouchableOpacity,
	ScrollView,
	View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const LOGO_SIZE = Math.min(Dimensions.get('window').width * 0.45, 190);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const STRONG_PASSWORD_MESSAGE =
	'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export default function RegisterScreen() {
	const router = useRouter();
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
			// Simulate a simple register request.
			await new Promise((resolve) => setTimeout(resolve, 1000));
			Alert.alert('Account created', `Welcome, ${trimmedName}!`);
			router.replace('/login');
		} catch (error) {
			Alert.alert('Registration failed', 'Please try again.');
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
							<Text style={styles.title}>Create account</Text>
						</View>

						<TextInput
							value={fullName}
							onChangeText={(value) => {
								setFullName(value);
								if (fullNameError) {
									setFullNameError('');
								}
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
								if (emailError) {
									setEmailError('');
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
								if (confirmPasswordError) {
									setConfirmPasswordError('');
								}
							}}
							placeholder="Confirm password"
							placeholderTextColor="#94a3b8"
							secureTextEntry
							autoCapitalize="none"
							style={[styles.input, confirmPasswordError ? styles.inputError : null]}
						/>
						{confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleRegister}
							disabled={loading}
							activeOpacity={0.85}
						>
							{loading ? (
								<ActivityIndicator color="#ffffff" />
							) : (
								<Text style={styles.buttonText}>Register</Text>
							)}
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
		paddingTop: 28,
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
		marginBottom: 14,
	},
	title: {
		fontSize: 30,
		fontWeight: '700',
		color: '#0e2f77',
		marginBottom: 4,
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
	button: {
		height: 52,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#2563eb',
		marginTop: 8,
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
	loginRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 16,
	},
	loginText: {
		color: '#475569',
		fontSize: 14,
	},
	loginLink: {
		color: '#2563eb',
		fontSize: 14,
		fontWeight: '700',
	},
});
