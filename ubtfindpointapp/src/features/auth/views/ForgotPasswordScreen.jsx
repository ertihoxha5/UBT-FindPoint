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

const LOGO_SIZE = Math.min(Dimensions.get('window').width * 0.5, 200);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const { forgotPassword } = useAuthViewModel();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [emailError, setEmailError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [resetToken, setResetToken] = useState('');

	const handleForgotPassword = async () => {
		const trimmedEmail = email.trim();

		setEmailError('');
		setSuccessMessage('');
		setResetToken('');

		if (!trimmedEmail) {
			setEmailError('Email is required.');
			return;
		}

		if (!EMAIL_REGEX.test(trimmedEmail)) {
			setEmailError('Please enter a valid email address.');
			return;
		}

		setLoading(true);

		try {
			const result = await forgotPassword(trimmedEmail);
			setSuccessMessage(result.message || 'Password reset request sent.');

			if (result.resetToken) {
				setResetToken(result.resetToken);
				Alert.alert('Reset token created', 'A reset token is available in development.');
				router.push({ pathname: '/reset-password', params: { token: result.resetToken } });
			}
		} catch (error) {
			const message = error?.response?.data?.error || error?.message || 'Please try again.';
			setEmailError(message);
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
							<Text style={styles.title}>Forgot password</Text>
							<Text style={styles.subtitle}>Enter your email to get a reset token.</Text>
						</View>

						<TextInput
							value={email}
							onChangeText={(value) => {
								setEmail(value);
								if (emailError) {
									setEmailError('');
								}
								if (successMessage) {
									setSuccessMessage('');
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
						{successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
						{resetToken ? <Text style={styles.tokenText}>Reset token: {resetToken}</Text> : null}

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleForgotPassword}
							disabled={loading}
							activeOpacity={0.85}
						>
							{loading ? (
								<ActivityIndicator color="#ffffff" />
							) : (
								<Text style={styles.buttonText}>Send reset token</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
							<Text style={styles.backLink}>Back to login</Text>
						</TouchableOpacity>
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
		fontSize: 30,
		fontWeight: '700',
		color: '#0e2f77',
		marginBottom: 4,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 15,
		color: '#475569',
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
	successText: {
		color: '#166534',
		fontSize: 13,
		marginBottom: 10,
	},
	tokenText: {
		color: '#0f172a',
		fontSize: 12,
		marginBottom: 14,
		backgroundColor: '#dbeafe',
		padding: 12,
		borderRadius: 12,
	},
	button: {
		height: 52,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#0e2f77',
		marginTop: 6,
		marginBottom: 16,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '700',
	},
	backLink: {
		textAlign: 'center',
		color: '#2563eb',
		fontSize: 14,
		fontWeight: '600',
	},
});
