import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { LayoutDashboard, LibraryBig, BookCopy, Landmark, Calendar, Megaphone, User, Shapes } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProgramStack from './ProgramStack';
import DashboardScreen from '../screens/DashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AccountStack from './AccountStack';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import StudentCourseStack from './StudentCourseStack';
import InstructorClassStack from './InstructorClassStack';

const Tab = createBottomTabNavigator();

const TabBarItem = ({ isFocused, onPress, label, icon: IconComponent }) => {
  const { width: screenWidth } = useWindowDimensions();
  const dynamicMaxWidth = screenWidth * 0.15;
  const dynamicMaxWidth2 = screenWidth * 0.05;
  const labelWidth = label.length * 0.1;
  
  const animatedWrapperStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: withSpring(16, { damping: 15, stiffness: 10 }),
      backgroundColor: isFocused ? '#ddd6fe' : 'transparent', 
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isFocused ? labelWidth * dynamicMaxWidth + dynamicMaxWidth2 : 0, { duration: 200 }),
      opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    };
  });

  return (
    <TouchableOpacity onPress={() => onPress()} activeOpacity={1}>
      <Animated.View style={[animatedWrapperStyle]} className={`flex-row items-center justify-center rounded-full py-2 border-t ${isFocused ? 'border-violet-200' : 'border-transparent'}`}>
        <IconComponent 
          color={isFocused ? '#5b21b6' : '#947BB7'} 
          size={24} 
          strokeWidth={isFocused ? 1.8 : 1.6}
        />
        <Animated.View style={[animatedTextStyle, { overflow: 'hidden' }]}>
          <Text
            numberOfLines={1} 
            className="text-violet-800 font-poppins-bold ml-2"
            style={{ fontSize: dynamicMaxWidth2 * 0.52 }}
          >
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

function CustomTabBar({ state, navigation, roleTab }) {
  const insets = useSafeAreaInsets();
  return (
      <View style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 16 }}
      className="absolute bottom-0 left-0 right-0 flex-row bg-violet-50 border-t border-slate-100 p-4 items-center justify-between">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          
          const icons = {
            Dashboard: LayoutDashboard,
            RoleTab: roleTab.icon, 
            Calendar: Calendar,
            News: Megaphone,
            Account: User,
          };
          const IconComponent = icons[route.name] || Shapes;

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
              label={displayLabel}
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
      case 'instructor': return { name: 'Classes', icon: BookCopy, component: InstructorClassStack };
      case 'program_head': return { name: 'Programs', icon: Landmark, component: ProgramStack };
      case 'student':
      case 'class_officer': return { name: 'Courses', icon: LibraryBig, component: StudentCourseStack };
      default: return { name: 'Courses', icon: LibraryBig, component: StudentCourseStack };
    }
  };

  const roleTab = getRoleTabConfig();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} roleTab={roleTab} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="RoleTab" component={roleTab.component} options={{ popToTopOnBlur: true }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="News" component={AnnouncementsScreen} />
      <Tab.Screen name="Account" component={AccountStack} options={{ popToTopOnBlur: true }} />
    </Tab.Navigator>
  );
}