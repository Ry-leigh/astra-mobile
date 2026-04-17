import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import client from "../api/client";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  roles: [],
  activeRole: null,
  isLoading: true,
  setAuth: async (user, token) => {
    const userRoles = user.roles || [];
    const defaultRole = userRoles.length > 0 ? userRoles[0].name : 'guest';

    await SecureStore.setItemAsync('userToken', token);
    
    set({ 
      user, 
      token, 
      roles: userRoles,
      activeRole: defaultRole, 
      isLoading: false,
    });

    get().syncPushToken(); 
  },

  syncPushToken: async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      const currentUser = get().user;

      if (token && currentUser) {
        await client.post('/user/push-token', { token });
      }
    } catch (error) {
      console.error("Failed to sync push token:", error);
    }
  },

  setActiveRole: async (roleName) => {
    set({ activeRole: roleName });
    await SecureStore.setItemAsync('activeRole', roleName);
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const savedRole = await SecureStore.getItemAsync('activeRole'); // Check for saved preference
      
      if (!token) return set({ isLoading: false });

      const response = await client.get('/user');
      const { user } = response.data.data;

      if (user) {
        set({ 
          user, 
          token, 
          roles: user.roles || [],
          // Priority: 1. Current session, 2. Saved preference, 3. First role available
          activeRole: get().activeRole || savedRole || user.roles?.[0]?.name || 'guest',
          isLoading: false 
        });
        get().syncPushToken();
      }
    } catch (e) {
      await SecureStore.deleteItemAsync('userToken');
      set({ user: null, token: null, roles: [], activeRole: null, isLoading: false });
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