import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create((set) => ({
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
  },

  setActiveRole: (role) => set({ activeRole: role }),

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
          set({ isLoading: false });
          return;
      }

      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.user) {
          const user = response.data.user;
          const role = user.roles.name || 'guest';
          set({ user, token, activeRole: role, isLoading: false });
      }
    } catch (e) {
      console.log("Token invalid or expired, logging out...");
      await SecureStore.deleteItemAsync('userToken');
      set({ user: null, token: null, activeRole: null, isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, token: null, activeRole: null });
  }
}));