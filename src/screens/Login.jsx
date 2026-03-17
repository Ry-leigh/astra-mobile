import { GoogleSigninButton, isSuccessResponse, isErrorWithCode, statusCodes, GoogleSignin } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

import { useAuthStore } from '../store/authStore';
import client from '../api/client';

const Login = () => {
	const setAuth = useAuthStore((state) => state.setAuth);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');

	useEffect(() => {
		GoogleSignin.configure({
			webClientId: '647074760883-i8qj7g6gj26n5ttfoqpnq2rrqvdofk3v.apps.googleusercontent.com',
			offlineAccess: true,
		});
	}, []);

	const handleGoogleSignin = async () => {
		try {
			setMessage('');
			setIsSubmitting(true);
			await GoogleSignin.hasPlayServices();
			const googleResponse = await GoogleSignin.signIn();

			if (isSuccessResponse(googleResponse)) {
				const { idToken } = googleResponse.data;

				const response = await client.post('/auth/google', { token: idToken });
				const { token, user } = response.data.data;
				await setAuth(user, token);

				console.log("Authenticated as:", user.email);
			}
		} catch (error) {
			console.error("Sign in error:", error);
			setMessage(error.response?.data?.message || "Login failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className="flex-1 bg-white items-center justify-center p-4">

			<GoogleSigninButton
				size={GoogleSigninButton.Size.Wide}
				color={GoogleSigninButton.Color.Dark}
				onPress={handleGoogleSignin}
				disabled={isSubmitting}
			/>

			{isSubmitting && (
				<ActivityIndicator className="mt-4" />
			)}

			{message && (
				<Text className="mt-4 text-red-500">{message}</Text>
			)}
		</View>
	);
}

export default Login;