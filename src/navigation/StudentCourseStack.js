// src/navigation/StudentCourseStack (or wherever this is located)
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentCoursesScreen from '../screens/StudentCoursesScreen';
import ClassScreen from '../screens/ClassScreen';
import ManagementClassScreen from '../screens/ManagementClassScreen';
import ManagementStudentAttendanceScreen from '../screens/ManagementStudentAttendanceScreen';
import ManagementSessionScreen from '../screens/ManagementSessionScreen';
import ManagementAttendanceScreen from '../screens/ManagementAttendanceScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function CourseStack() {
  const { activeRole } = useAuthStore();
  
  return (
    <Stack.Navigator 
      initialRouteName="CourseList"
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' } 
      }}
    >
      <Stack.Screen name="CourseList" component={StudentCoursesScreen} />
      {activeRole === 'student' && <Stack.Screen name="Class" component={ClassScreen} />}
      
      {activeRole === 'class_officer' && (
        <Stack.Group>
          <Stack.Screen name="ManageClass" component={ManagementClassScreen}/>
          <Stack.Screen name="ManageStudentAttendance" component={ManagementStudentAttendanceScreen} />
          <Stack.Screen name="ManageSession" component={ManagementSessionScreen} />
          <Stack.Screen name="ManageAttendance" component={ManagementAttendanceScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}