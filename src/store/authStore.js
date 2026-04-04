import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import client from "../api/client";
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  activeRole: null,
  isLoading: true,

  setAuth: async (user, token) => {
    const role = user.roles && user.roles.length > 0 ? user.roles[0].name : 'guest';
    await SecureStore.setItemAsync('userToken', token);
    
    set({ 
      user, 
      token, 
      activeRole: role, 
      isLoading: false 
    });

    get().syncPushToken(); 
  },

  syncPushToken: async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      const currentUser = get().user;

      if (token && currentUser) {
        await client.post('/user/push-token', { token });
        console.log("Push token synced to backend.");
      }
    } catch (error) {
      console.error("Failed to sync push token:", error);
    }
  },

  setActiveRole: (role) => set({ activeRole: role }),

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await client.get('/user');

      if (response.data.data) {
        const user = response.data.data.user;
        const role = response.data.data.roles?.[0] || 'guest';
        set({ user, token, activeRole: role, isLoading: false });
        get().syncPushToken();
      }
    } catch (e) {
      console.log("Session expired or network error");
      await SecureStore.deleteItemAsync('userToken');
      set({ user: null, token: null, activeRole: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await GoogleSignin.signOut();
    } catch (signOutError) {
      console.log("Google SignOut failed");
    }
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, token: null, activeRole: null });
  },
}));