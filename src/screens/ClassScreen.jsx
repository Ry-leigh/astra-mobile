import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Layout from '../components/Layout';
import { useEnrollmentDetails } from '../hooks/useEnrollments';
import { useClassStudents } from '../hooks/useClassStudents';
import { Users, ClipboardCheck, User as UserIcon, Mail, CheckCircle2 } from 'lucide-react-native';

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
          {log.isVerified && (
            <CheckCircle2 size={14} color="#10b981" />
          )}
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

const ClassScreen = () => {
  const route = useRoute();
  const { classId, courseName, courseCode } = route.params;
  const { data: enrollment, isLoading } = useEnrollmentDetails(classId);
  const { data: classmates, isLoading: loadingStudents } = useClassStudents(classId);
  
  const [activeTab, setActiveTab] = useState('Attendance');

  if (isLoading) {
    return (
      <Layout backButton>
        <View className="flex-1 gap-2 justify-center items-center">
          <ActivityIndicator color="#4f46e5" />
          <Text className="font-poppins-semibold text-sm text-center text-slate-900">{courseName}</Text>
        </View>
      </Layout>
    );
  }

  const metrics = enrollment?.attendanceMetrics;

  return (
    <Layout title={courseCode} backButton>
      <View className="flex-row">
        {['Students', 'Attendance'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 pb-2 mb-4 items-center border-b-2 ${
              activeTab === tab ? 'border-indigo-600' : 'border-transparent'
            }`}
          >
            <Text className={`font-poppins-semibold ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'Attendance' ? (
          <View>
            <View className="flex-row flex-wrap gap-4">
              <AttendanceStat label="Absences" value={metrics?.absent} color="text-rose-500" bgColor="bg-rose-50" />
              <AttendanceStat label="Lates" value={metrics?.late} color="text-amber-500" bgColor="bg-amber-50" />
              <AttendanceStat label="Grace" value={metrics?.gracePresents} color="text-emerald-500" bgColor="bg-emerald-50" />
              <AttendanceStat label="Excused" value={metrics?.excused} color="text-blue-500" bgColor="bg-blue-50" />
            </View>
            
            {activeTab === 'Attendance' && (
              <View className="mt-4">
                <Text className="font-poppins-semibold text-slate-400 text-xs uppercase mb-4 tracking-widest">
                  Recent Logs
                </Text>
                {enrollment.logs?.length > 0 ? (
                  enrollment.logs.map(log => <AttendanceLogItem key={log.id} log={log} />)
                ) : (
                  <View className="items-center mt-10 py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                    <ClipboardCheck size={40} color="#cbd5e1" />
                    <Text className="font-poppins text-slate-400 mt-2">No logs found yet.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View>
            {loadingStudents ? (
              <ActivityIndicator color="#4f46e5" className="mt-10" />
            ) : (
              classmates?.map((student) => (
                <View 
                  key={student.id} 
                  className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 flex-row items-center"
                >
                  <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-4">
                    {student.photo ? (
                      <Image source={{ uri: student.photo }} className="w-10 h-10 rounded-full" />
                    ) : (
                      <UserIcon size={20} color="#94a3b8" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-slate-800">{student.fullName}</Text>
                    <Text className="font-poppins text-slate-400 text-xs">Student</Text>
                  </View>
                </View>
              ))
            )}
            
            {classmates?.length === 0 && !loadingStudents && (
              <View className="items-center mt-10">
                <Text className="font-poppins text-slate-400">No classmates found.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const AttendanceStat = ({ label, value, color, bgColor }) => (
  <View className={`flex-[1_1_40%] p-5 rounded-3xl ${bgColor} border border-white/50`}>
    <Text className={`font-poppins-semibold text-2xl ${color}`}>{value || 0}</Text>
    <Text className="font-poppins-medium text-slate-500 text-xs uppercase tracking-wider">{label}</Text>
  </View>
);

export default ClassScreen;