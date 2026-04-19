import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { queryClient } from '../api/queryClient';

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
      const client = require('../api/client').default;
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
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('userToken');
      const savedRole = await SecureStore.getItemAsync('activeRole');
      
      if (!token) return set({ isLoading: false });

      set({ token: token });

      const client = require('../api/client').default; 
      const response = await client.get('/user');

      const { user } = response.data.data;

      if (user) {
        set({ 
          user, 
          token, 
          roles: user.roles || [],
          activeRole: get().activeRole || savedRole || user.roles?.[0]?.name || 'guest',
          isLoading: false 
        });
        get().syncPushToken();
      }
    } catch (e) {
      await SecureStore.deleteItemAsync('userToken');
      console.log("Error: ", e);
      set({ user: null, token: null, roles: [], activeRole: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await GoogleSignin.signOut();
    } catch (signOutError) {
      console.log("Google SignOut failed");
    }
    queryClient.clear();
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, token: null, activeRole: null });
  },
}));