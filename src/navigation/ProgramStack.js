import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProgramsScreen from '../screens/ProgramListScreen';
import SectionListScreen from '../screens/SectionListScreen';
import ClassListScreen from '../screens/ClassListScreen';
import ClassScreen from '../screens/ClassScreen';
import SessionScreen from '../screens/SessionScreen';

const Stack = createNativeStackNavigator();

export default function ProgramStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ProgramList" component={ProgramsScreen} options={{ title: 'Programs' }} />
      <Stack.Screen name="SectionList" component={SectionListScreen} options={{ title: 'Sections' }} />
      <Stack.Screen name="ClassList" component={ClassListScreen} options={{ title: 'Classes' }} />
      <Stack.Screen name="Class" component={ClassScreen} options={{ title: 'Class' }} />
      <Stack.Screen name="Session" component={SessionScreen} options={{ title: 'Session' }} />
    </Stack.Navigator>
  );
}