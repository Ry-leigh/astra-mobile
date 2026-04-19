import AsyncStorage from '@react-native-async-storage/async-storage';

export const clientStorage = {
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to AsyncStorage', error);
    }
  },
  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error reading from AsyncStorage', error);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage', error);
    }
  },
};