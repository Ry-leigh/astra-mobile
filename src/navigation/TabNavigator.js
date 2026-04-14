import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LayoutDashboard, LibraryBig, BookCopy, Landmark, Calendar, Megaphone, User, Shapes } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';

import ProgramStack from './ProgramStack';
import DashboardScreen from '../screens/DashboardScreen';
import StudentCoursesScreen from '../screens/StudentCoursesScreen';
import InstructorClassesScreen from '../screens/InstructorClassesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AccountScreen from '../screens/AccountScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';

const Tab = createBottomTabNavigator();

// 1. The new explicitly animated component
const TabBarItem = ({ isFocused, onPress, route, icon: IconComponent }) => {
  const [textWidth, setTextWidth] = useState(0);
  // Animate the background and padding safely
  const animatedWrapperStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: withSpring(16, { damping: 15, stiffness: 10 }),
      backgroundColor: isFocused ? '#ede9fe' : 'transparent', // #ede9fe is Tailwind violet-100
    };
  });

  // Animate the text width from 0 to its full size so it pushes the icons smoothly
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isFocused ? route.name.length * 5 + 28 : 0, { duration: 200 }),
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
            className="text-violet-600 font-bold ml-2 text-sm"
          >
            {route.name}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// 2. The Custom Tab Bar mapping
function CustomTabBar({ state, descriptors, navigation, roleTab }) {
  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row bg-white pb-8 pt-4 px-4 shadow-lg shadow-black items-center justify-between">
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        
        const icons = {
          Home: LayoutDashboard,
          [roleTab.name]: roleTab.icon,
          Calendar: Calendar,
          News: Megaphone,
          Account: User,
        };
        const IconComponent = icons[route.name] || Shapes;

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
            route={route}
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
      // Ensure the scene background is transparent so it relies on the Stack's #fff
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name={roleTab.name} component={roleTab.component} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="News" component={AnnouncementsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}