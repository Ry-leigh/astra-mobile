// import './global.css'; // Ensure NativeWind is loaded
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/index.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}