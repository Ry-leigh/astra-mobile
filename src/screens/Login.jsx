import React, { useState, useEffect } from "react";
import { View, Text, Image, ImageBackground, TouchableOpacity, ActivityIndicator, ScrollView, Button } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import { useAuthStore } from "../store/authStore";
import client from "../api/client";
import { registerForPushNotificationsAsync } from '../services/notificationService';
import googleGLogo from "../assets/google-g-logo.png";
import lvccLogo from "../assets/lvcc-logo.png";
import lvccTextLogo from "../assets/lvcc-logo-text-white.png";
import astraLogo from "../assets/astra-logo.png";
import background from "../assets/login-bg.png";

const Login = () => {
  const insets = useSafeAreaInsets();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '647074760883-i8qj7g6gj26n5ttfoqpnq2rrqvdofk3v.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const savePushToken = async (token) => {
    try {
      const expoToken = await registerForPushNotificationsAsync();
      if (expoToken) {
        await client.post('/user/push-token', 
          { token: expoToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      setMessage("");
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      try {
        await GoogleSignin.signOut();
      } catch (e) {}
      const googleResponse = await GoogleSignin.signIn();
      
      if (isSuccessResponse(googleResponse)) {
        const { idToken, user: googleUser } = googleResponse.data;
        const response = await client.post("/auth/google", { 
          token: idToken, 
          photoUrl: googleUser.photo 
        });

        const { token, user } = response.data.data;
        await setAuth(user, token);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setMessage(error.response?.data?.message || "Server down. Please try again later");
      try { await GoogleSignin.signOut(); } catch (e) {}
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevLogin = async (email) => {
    try {
      const response = await client.post("/auth/dev-login", { email });
      const { token, user } = response.data.data;
      console.log(token);
      await setAuth(user, token);
    } catch (error) {
      console.error("Dev login error:", error);
    }
  };

  return (
    <View className="flex-1 bg-indigo-950">
      <View className="absolute inset-0">
        <ImageBackground source={background} className="flex-1" resizeMode="cover">
          <View className="flex-1 bg-indigo-900/60" style={{ backgroundColor: 'rgba(30, 27, 75, 0.6)' }} />
        </ImageBackground>
      </View>

      <SafeAreaView className="flex-1">
        <View className="flex-1 flex-col items-center justify-between px-6">
          
          <View className="items-center mt-12 w-full">
            <View className="w-48 h-48 mb-4">
              <Image source={lvccLogo} className="w-full h-full" resizeMode="contain"/>
            </View>

            <View className="w-80 h-24">
              <Image source={lvccTextLogo} className="w-full h-full" resizeMode="cover"/>
            </View>

            {/* <Text className="text-6xl text-white tracking-widest text-center  " style={{ fontFamily: 'Tolkien' }}>
              La Verdad
            </Text>
            <Text className="text-3xl text-white mb-2 tracking-widest text-center" style={{ fontFamily: 'Tolkien' }}>
              Christian College
            </Text> */}

            <View className="h-[2px] bg-amber-400 w-40 m-4" />

            <Text className="text-indigo-100 text-sm font-poppins-light-it tracking-wider text-center">
              "Wisdom based on truth is priceless"
            </Text>
          </View>

          <View className="w-full max-w-md mb-12">
            {message ? (
              <Text className="font-poppins-light text-sm text-red-400 text-center mb-4">{message}</Text>
            ) : null}
            <TouchableOpacity
              onPress={handleGoogleSignin}
              disabled={isSubmitting}
              activeOpacity={0.8}
              className="w-full bg-white flex-row items-center justify-center py-4 px-6 rounded-2xl"
            >
              <Image source={googleGLogo} className="w-6 h-6 mr-4"/>
              <Text className="text-slate-700 font-poppins-semibold text-lg">
                {isSubmitting ? "Signing in..." : "Sign in with Google"}
              </Text>
            </TouchableOpacity>

            {/* Branding Footer */}
            <View className="mt-8 flex-row items-center justify-center opacity-40">
              <Text className="text-white text-[8px] font-medium uppercase tracking-[0.2em] mr-2">
                Brought to you by:
              </Text>
              <View className="flex-row items-center">
                <Image 
                  source={astraLogo} 
                  className="h-4 w-4 mr-1"
                  style={{ tintColor: 'white' }}
                  resizeMode="contain"
                />
                <Text className="text-white text-[8px] font-bold tracking-wider">ASTRA</Text>
              </View>
            </View>

            {__DEV__ && (
              <View className="mt-6 border-t border-white/20 pt-4 flex-row flex-wrap justify-center">
                <TouchableOpacity onPress={() => handleDevLogin('student01@astra.test')} className="m-1 bg-white/10 p-2 rounded">
                  <Text className="text-white text-xs">Student</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDevLogin('instructor04@astra.test')} className="m-1 bg-white/10 p-2 rounded">
                  <Text className="text-white text-xs">Instructor</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDevLogin('programhead01@astra.test')} className="m-1 bg-white/10 p-2 rounded">
                  <Text className="text-white text-xs">Program Head</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDevLogin('classofficer01@astra.test')} className="m-1 bg-white/10 p-2 rounded">
                  <Text className="text-white text-xs">Class Officer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
};

export default Login;