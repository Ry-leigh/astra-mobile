import "../global.css";
import React, { useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/index.js";
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { Poppins_100Thin, Poppins_100Thin_Italic, Poppins_200ExtraLight, Poppins_200ExtraLight_Italic, Poppins_300Light, Poppins_300Light_Italic, Poppins_400Regular, Poppins_400Regular_Italic, Poppins_500Medium, Poppins_500Medium_Italic, Poppins_600SemiBold, Poppins_600SemiBold_Italic, Poppins_700Bold, Poppins_700Bold_Italic, Poppins_800ExtraBold, Poppins_800ExtraBold_Italic, Poppins_900Black, Poppins_900Black_Italic,} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { clientStorage } from './lib/storage.js';
import { queryClient } from './api/queryClient.js';

SplashScreen.preventAutoHideAsync();

const asyncStoragePersister = createAsyncStoragePersister({
  storage: clientStorage,
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Poppins_100Thin, Poppins_100Thin_Italic, Poppins_200ExtraLight, Poppins_200ExtraLight_Italic, Poppins_300Light, Poppins_300Light_Italic, Poppins_400Regular, Poppins_400Regular_Italic, Poppins_500Medium, Poppins_500Medium_Italic, Poppins_600SemiBold, Poppins_600SemiBold_Italic, Poppins_700Bold, Poppins_700Bold_Italic, Poppins_800ExtraBold, Poppins_800ExtraBold_Italic, Poppins_900Black, Poppins_900Black_Italic, 'Tolkien': require('./assets/fonts/Tolkien.ttf'), });

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PersistQueryClientProvider 
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}