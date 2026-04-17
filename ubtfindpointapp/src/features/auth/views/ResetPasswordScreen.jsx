import React, { useMemo, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthViewModel } from '../viewmodel/AuthViewModel';

const LOGO_SIZE = Math.min(Dimensions.get('window').width * 0.5, 200);
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const STRONG_PASSWORD_MESSAGE =
	'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

export default function ResetPasswordScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const { resetPassword } = useAuthViewModel();
	const initialToken = useMemo(() => {
		const token = params.token;

		return Array.isArray(token) ? token[0] ?? '' : token ?? '';
	}, [params.token]);
	const [resetToken, setResetToken] = useState(initialToken);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [tokenError, setTokenError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');

	const handleResetPassword = async () => {
		const trimmedToken = resetToken.trim();
		const trimmedPassword = newPassword.trim();
		const trimmedConfirmPassword = confirmPassword.trim();
		let hasError = false;

		setTokenError('');
		setPasswordError('');
		setConfirmPasswordError('');

		if (!trimmedToken) {
			setTokenError('Reset token is required.');
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
			setConfirmPasswordError('Please confirm your new password.');
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
			const result = await resetPassword(trimmedToken, trimmedPassword);
			Alert.alert('Password updated', result.message || 'Your password has been updated.');
			router.replace('/login');
		} catch (error) {
			const message = error?.response?.data?.error || error?.message || 'Please try again.';
			setTokenError(message);
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
							<Text style={styles.title}>Reset password</Text>
							<Text style={styles.subtitle}>Set your new password using the reset token.</Text>
						</View>

						<TextInput
							value={resetToken}
							onChangeText={(value) => {
								setResetToken(value);
								if (tokenError) {
									setTokenError('');
								}
							}}
							placeholder="Reset token"
							placeholderTextColor="#94a3b8"
							autoCapitalize="none"
							autoCorrect={false}
							style={[styles.input, tokenError ? styles.inputError : null]}
						/>
						{tokenError ? <Text style={styles.errorText}>{tokenError}</Text> : null}

						<TextInput
							value={newPassword}
							onChangeText={(value) => {
								setNewPassword(value);
								if (passwordError) {
									setPasswordError('');
								}
							}}
							placeholder="New password"
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
							onPress={handleResetPassword}
							disabled={loading}
							activeOpacity={0.85}
						>
							{loading ? (
								<ActivityIndicator color="#ffffff" />
							) : (
								<Text style={styles.buttonText}>Update password</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.8}>
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
