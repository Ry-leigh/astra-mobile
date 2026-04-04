import {
  GoogleSigninButton,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
  GoogleSignin,
} from "@react-native-google-signin/google-signin";
import { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, Button } from "react-native";

import { useAuthStore } from "../store/authStore";
import client from "../api/client";

import { registerForPushNotificationsAsync } from '../services/notificationService';
import axios from 'axios';
    
const Login = () => {
		useEffect(() => {
			GoogleSignin.configure({
				webClientId: '647074760883-i8qj7g6gj26n5ttfoqpnq2rrqvdofk3v.apps.googleusercontent.com',
				offlineAccess: true,
			});
		}, []);

  const setAuth = useAuthStore((state) => state.setAuth);
  const authToken = useAuthStore((state) => state.token); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const savePushToken = async (token) => {
    try {
      const expoToken = await registerForPushNotificationsAsync();
      if (expoToken) {
        await client.post('/user/push-token', 
          { token: expoToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Push token synced to ASTRA backend.');
      }
    } catch (error) {
      console.error('Push token sync failed:', error);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      setMessage("");
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const googleResponse = await GoogleSignin.signIn();

      if (isSuccessResponse(googleResponse)) {
        const { idToken } = googleResponse.data;
        const response = await client.post("/auth/google", { token: idToken });
        const { token, user } = response.data.data;
        
        await setAuth(user, token);
        await savePushToken(token); 

        console.log("Authenticated as:", user.email);
        console.log("Token:", token);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      console.log(error.response?.data?.message || "Login failed");
      setMessage(error.response?.data?.message || "Login failed");
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log("Google SignOut failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevLogin = async (email) => {
    try {
      const response = await client.post("/auth/dev-login", { email });
      const { token, user } = response.data.data;
      
      await setAuth(user, token);
      
      await savePushToken(token);
    } catch (error) {
      console.error("Dev login error:", error);
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

      {__DEV__ && (
				<View className="mt-10 border-t border-gray-200 pt-4">
					<Button title="Login as Student" onPress={() => handleDevLogin('student01@astra.test')} />
					<Button title="Login as Class Officer" onPress={() => handleDevLogin('classofficer01@astra.test')} />
					<Button title="Login as Instructor" onPress={() => handleDevLogin('instructor01@astra.test')} />
					<Button title="Login as Program Head" onPress={() => handleDevLogin('programhead01@astra.test')} />
				</View>
			)}

      {isSubmitting && <ActivityIndicator className="mt-4" />}

      {message && <Text className="mt-4 text-red-500">{message}</Text>}
    </View>
  );
};

export default Login;
