import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useRoute } from '@react-navigation/native';
import { useStudentClassDetails } from '../hooks/useEnrollments'; // Adjust import path if needed
import { ClipboardCheck, CheckCircle2 } from 'lucide-react-native';

const ManagementStudentAttendanceScreen = () => {
  const route = useRoute();
  // These params were passed from ManagementClassScreen
  const { classId, studentId, studentName } = route.params;

  const { data: enrollment, isLoading } = useStudentClassDetails(classId, studentId);

  if (isLoading) {
    return (
      <Layout title={studentName} backButton>
        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4f46e5" /></View>
      </Layout>
    );
  }

  const metrics = enrollment?.attendanceMetrics;

  return (
    <Layout title={studentName} backButton>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Attendance Summary Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <AttendanceStat label="Absences" value={metrics?.absent} color="text-rose-500" bgColor="bg-rose-50" />
          <AttendanceStat label="Lates" value={metrics?.late} color="text-amber-500" bgColor="bg-amber-50" />
          <AttendanceStat label="Excused" value={metrics?.excused} color="text-blue-500" bgColor="bg-blue-50" />
          <AttendanceStat label="Grace" value={metrics?.gracePresents} color="text-emerald-500" bgColor="bg-emerald-50" />
        </View>

        {/* Logs List */}
        <View>
          <Text className="font-poppins-semibold text-slate-400 text-xs uppercase mb-4 tracking-widest">
            Attendance History
          </Text>
          
          {enrollment?.logs?.length > 0 ? (
            enrollment.logs.map((log) => <AttendanceLogItem key={log.id} log={log} />)
          ) : (
            <View className="items-center mt-6 py-10 border-2 border-dashed border-slate-100 rounded-3xl">
              <ClipboardCheck size={40} color="#cbd5e1" />
              <Text className="font-poppins text-slate-400 mt-2">No logs found for this student.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </Layout>
  );
};

// Helper Components (Identical to the ones in ClassScreen)
const AttendanceStat = ({ label, value, color, bgColor }) => (
  <View className={`flex-[1_1_40%] p-5 rounded-3xl ${bgColor} border border-white/50`}>
    <Text className={`font-poppins-semibold text-2xl ${color}`}>{value || 0}</Text>
    <Text className="font-poppins-medium text-slate-500 text-xs uppercase tracking-wider">{label}</Text>
  </View>
);

const AttendanceLogItem = ({ log }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': 
      case 'Grace Present': return 'text-emerald-600 bg-emerald-50';
      case 'Late': return 'text-amber-600 bg-amber-50';
      case 'Absent': return 'text-rose-600 bg-rose-50';
      case 'Suspended': return 'text-slate-600 bg-slate-100';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <View className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 flex-row items-center justify-between">
      <View className="flex-1 mr-2">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-poppins-semibold text-slate-800 text-base">
            {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          {log.isVerified && <CheckCircle2 size={14} color="#10b981" />}
        </View>
        <Text className="font-poppins text-slate-400 text-xs mt-0.5">
          {log.time ? `Check-in: ${log.time}` : 'No timestamp'}
        </Text>
        {log.remarks && (
          <Text className="font-poppins-medium text-slate-500 text-[10px] mt-1 bg-slate-50 self-start px-2 py-0.5 rounded-md">
            Note: {log.remarks}
          </Text>
        )}
      </View>
      <View className={`px-4 py-1.5 rounded-xl ${getStatusColor(log.status)}`}>
        <Text className="font-poppins-bold text-[10px] uppercase tracking-widest">{log.status}</Text>
      </View>
    </View>
  );
};

export default ManagementStudentAttendanceScreen;
// the courses->class->[student_id] attendance logs screen of a class officer or higher, shows the student's logs in the class