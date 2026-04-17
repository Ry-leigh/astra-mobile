import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LayoutDashboard, LibraryBig, BookCopy, Landmark, Calendar, Megaphone, User, Shapes } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProgramStack from './ProgramStack';
import DashboardScreen from '../screens/DashboardScreen';
import StudentCoursesScreen from '../screens/StudentCoursesScreen';
import InstructorClassesScreen from '../screens/InstructorClassesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AccountStack from './AccountStack';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';

const Tab = createBottomTabNavigator();

// 1. Updated to accept a 'label' prop instead of relying on 'route.name'
const TabBarItem = ({ isFocused, onPress, label, icon: IconComponent }) => {
  const animatedWrapperStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: withSpring(16, { damping: 15, stiffness: 10 }),
      backgroundColor: isFocused ? '#ede9fe' : 'transparent', 
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      // Use label.length instead of route.name.length
      width: withTiming(isFocused ? label.length * 8 + 8 : 0, { duration: 200 }),
      opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    };
  });

  return (
    <TouchableOpacity onPress={() => onPress()} activeOpacity={1}>
      <Animated.View style={[animatedWrapperStyle]} className="flex-row items-center justify-center rounded-full py-2">
        <IconComponent 
          color={isFocused ? '#8b5cf6' : '#94a3b8'} 
          size={24} 
          strokeWidth={isFocused ? 1.8 : 1.5}
        />
        <Animated.View style={[animatedTextStyle, { overflow: 'hidden' }]}>
          <Text
            numberOfLines={1} 
            className="text-violet-600 font-poppins-bold ml-2 text-xs"
          >
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// 2. The Custom Tab Bar mapping
function CustomTabBar({ state, navigation, roleTab }) {
  const insets = useSafeAreaInsets();
  return (
      <View style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 16 }}
      className="absolute bottom-0 left-0 right-0 flex-row bg-white p-4 shadow-lg shadow-black items-center justify-between">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          
          // Map to the static 'RoleTab' name
          const icons = {
            Dashboard: LayoutDashboard,
            RoleTab: roleTab.icon, 
            Calendar: Calendar,
            Announcements: Megaphone,
            Account: User,
          };
          const IconComponent = icons[route.name] || Shapes;

          // Dynamically decide the label to show the user
          const displayLabel = route.name === 'RoleTab' ? roleTab.name : route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabBarItem 
              key={index}
              isFocused={isFocused}
              onPress={onPress}
              label={displayLabel} // Pass the dynamic label down
              icon={IconComponent}
            />
          );
        })}
      </View>
  );
}

export default function TabNavigator() {
  const { activeRole } = useAuthStore();

  const getRoleTabConfig = () => {
    switch (activeRole) {
      case 'instructor': return { name: 'Classes', icon: BookCopy, component: InstructorClassesScreen };
      case 'program_head': return { name: 'Programs', icon: Landmark, component: ProgramStack };
      case 'student':
      case 'class_officer': return { name: 'Courses', icon: LibraryBig, component: StudentCoursesScreen };
      default: return { name: 'Courses', icon: LibraryBig, component: StudentCoursesScreen };
    }
  };

  const roleTab = getRoleTabConfig();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} roleTab={roleTab} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="RoleTab" component={roleTab.component} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
      <Tab.Screen name="Account" component={AccountStack} options={{ popToTopOnBlur: true }}/>
    </Tab.Navigator>
  );
}