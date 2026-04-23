import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from '../screens/AccountScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import ManagementScreen from '../screens/ApplicationManagementScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Stack = createNativeStackNavigator();

const AccountStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="AccountMenu"
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' } 
      }}
    >
      <Stack.Screen name="AccountMenu" component={AccountScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Management" component={ManagementScreen} />
    </Stack.Navigator>
  );
};

export default AccountStack;