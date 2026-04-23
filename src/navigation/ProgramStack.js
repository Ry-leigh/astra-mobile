import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProgramListScreen from '../screens/ProgramListScreen';
import SectionListScreen from '../screens/SectionListScreen';
import ClassListScreen from '../screens/ClassListScreen';
import ManagementClassScreen from '../screens/ManagementClassScreen';
import ManagementStudentAttendanceScreen from '../screens/ManagementStudentAttendanceScreen';
import ManagementSessionScreen from '../screens/ManagementSessionScreen';
import ManagementAttendanceScreen from '../screens/ManagementAttendanceScreen';

const Stack = createNativeStackNavigator();

export default function ProgramStack() {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' } 
      }}
    >
      <Stack.Screen name="ProgramList" component={ProgramListScreen} options={{ title: 'Programs' }} />
      <Stack.Screen name="SectionList" component={SectionListScreen} options={{ title: 'Sections' }} />
      <Stack.Screen name="ClassList" component={ClassListScreen} options={{ title: 'Classes' }} />
      <Stack.Screen name="ManageClass" component={ManagementClassScreen}/>
      <Stack.Screen name="ManageStudentAttendance" component={ManagementStudentAttendanceScreen} />
      <Stack.Screen name="ManageSession" component={ManagementSessionScreen} />
      <Stack.Screen name="ManageAttendance" component={ManagementAttendanceScreen} />
    </Stack.Navigator>
  );
}