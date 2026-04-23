import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InstructorClassesScreen from '../screens/InstructorClassesScreen';
import ManagementClassScreen from '../screens/ManagementClassScreen';
import ManagementStudentAttendanceScreen from '../screens/ManagementStudentAttendanceScreen';
import ManagementSessionScreen from '../screens/ManagementSessionScreen';
import ManagementAttendanceScreen from '../screens/ManagementAttendanceScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function InstructorClassStack() {
  const { activeRole } = useAuthStore();
  
  return (
    <Stack.Navigator 
      initialRouteName="ClassList"
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' } 
      }}
    >
        <Stack.Screen name="ClassList" component={InstructorClassesScreen} />
        <Stack.Screen name="ManageClass" component={ManagementClassScreen}/>
        <Stack.Screen name="ManageStudentAttendance" component={ManagementStudentAttendanceScreen} />
        <Stack.Screen name="ManageSession" component={ManagementSessionScreen} />
        <Stack.Screen name="ManageAttendance" component={ManagementAttendanceScreen} />
    </Stack.Navigator>
  );
}