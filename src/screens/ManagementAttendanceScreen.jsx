import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, Platform, InteractionManager } from 'react-native';
import Layout from '../components/Layout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useClassStudents, useSubmitAttendance, useSessionSnapshot, useVerifySession } from '../hooks/useClassStudents';
import { User as UserIcon, Clock3, CheckCircle2, CircleX, CircleAlert, MessageSquare, Circle, CircleCheckBig } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { format, parse } from 'date-fns';

const StudentAttendanceRow = React.memo(({ student, attendance, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const currentStatus = attendance?.status;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return { color: '#34d399', bg: 'bg-emerald-50 border-emerald-200' };
      case 'Late': return { color: '#d97706', bg: 'bg-amber-50 border-amber-200' };
      case 'Absent': return { color: '#f43f5e', bg: 'bg-rose-50 border-rose-200' };
      case 'Excused': return { color: '#3b82f6', bg: 'bg-blue-50 border-blue-200' };
      default: return { color: '#94a3b8', bg: 'bg-slate-50 border-slate-200' };
    }
  };

  const StatusBtn = ({ status, icon: Icon }) => {
    const active = currentStatus === status;
    const styles = getStatusColor(status);
    return (
      <TouchableOpacity 
        onPress={() => onUpdate(student.id, { ...attendance, status })}
        className={`flex-1 items-center justify-center p-3 rounded-2xl border ${active ? styles.bg : 'border-slate-200'}`}
      >
        <Icon size={22} color={active ? styles.color : '#94a3b8'} strokeWidth={active ? 1.5 : 1.2} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white p-4 rounded-3xl mb-3 border border-slate-100">
      <View className="justify-between gap-2">
        <View className="flex-row flex-1 items-center">
          <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
             {student.photo ? <Image source={{ uri: student.photo }} className="w-10 h-10 rounded-full" /> : <UserIcon size={20} color="#94a3b8" />}
          </View>
          <Text className="font-poppins-semibold text-slate-800 text-sm">{student.fullName}</Text>
        </View>
        
        <View className="flex-row gap-1">
          <StatusBtn status="Present" icon={CheckCircle2} />
          <StatusBtn status="Late" icon={Clock3} />
          <StatusBtn status="Absent" icon={CircleX} />
          <StatusBtn status="Excused" icon={CircleAlert} />
        </View>
      </View>

      <View className="flex-row items-center justify-between px-1 mt-3">
        <View className="flex-row items-center">
          {(() => {
            switch (attendance?.status) {
              case 'Present': return <CheckCircle2 size={14} color="#34d399" />;
              case 'Late':    return <Clock3 size={14} color="#d97706" />;
              case 'Absent':  return <CircleX size={14} color="#f43f5e" />;
              case 'Excused': return <CircleAlert size={14} color="#3b82f6" />;
              default:        return null;
            }
          })()}
          <Text className="ml-2 font-poppins-medium text-xs text-slate-400">
            {attendance?.status}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowDetails(!showDetails)}
          className="flex-row items-center justify-end"
        >
          <MessageSquare size={14} color="#94a3b8" />
          <Text className='ml-2 font-poppins-medium text-xs text-slate-400'>
            {attendance?.remarks ? 'Edit Remarks' : 'Add Remarks'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDetails && (
        <View className="mt-3 pt-3 border-t border-slate-50">
          <TextInput
            className="bg-slate-50 rounded-xl px-3 py-2 font-poppins-regular text-xs text-slate-700"
            placeholder="Add remarks (e.g., Doctor's note, reason for late)..."
            value={attendance?.remarks || ''}
            onChangeText={(val) => onUpdate(student.id, { ...attendance, remarks: val })}
          />
        </View>
      )}
    </View>
  );
});

const ManagementAttendanceScreen = () => {
  const [isTransitionFinished, setIsTransitionFinished] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { sessionId, classId } = route.params;
  const { activeRole } = useAuthStore();
  const isInstructor = activeRole === 'instructor' || activeRole === 'program_head';

  const { data: classmates, isLoading: loadingStudents } = useClassStudents(isTransitionFinished ? classId : null);
  const { data: snapshot } = useSessionSnapshot(isTransitionFinished ? sessionId : null);
  
  const submitMutation = useSubmitAttendance();
  const verifyMutation = useVerifySession();

  const [instructorTimeIn, setInstructorTimeIn] = useState(null);
  const [instructorTimeOut, setInstructorTimeOut] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [activePicker, setActivePicker] = useState('in');

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsTransitionFinished(true);
    });
  }, []);

  useEffect(() => {
    if (snapshot && classmates && Object.keys(attendanceData).length === 0) {
      if (snapshot.instructor_time_in) {
        setInstructorTimeIn(parse(snapshot.instructor_time_in, 'HH:mm', new Date()));
      }
      if (snapshot.instructor_time_out) {
        setInstructorTimeOut(parse(snapshot.instructor_time_out, 'HH:mm', new Date()));
      }

      const initialData = {};
      snapshot.logs?.forEach(log => {
        initialData[log.student_id] = {
          status: log.status,
          remarks: log.remarks,
          check_in_time: log.check_in_time
        };
      });
      setAttendanceData(initialData);
    }
  }, [snapshot, classmates]);

  const onTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      if (activePicker === 'in') setInstructorTimeIn(selectedDate);
      else setInstructorTimeOut(selectedDate);
    }
  };

  const handleUpdateStudent = useCallback((id, data) => {
    setAttendanceData(prev => ({ ...prev, [id]: data }));
  }, []);

  // RESTORED: Mark all present logic using the new object structure
  const handleMarkAllPresent = () => {
    if (!classmates) return;
    const newAttendance = {};
    classmates.forEach(s => {
      newAttendance[s.id] = { 
        status: 'Present', 
        remarks: null,
        check_in_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
    });
    setAttendanceData(newAttendance);
  };

  // RESTORED: Safe DB time formatter (H:i:s)
  const formatTimeForDB = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date)) return null;
    return format(dateObj, 'HH:mm:ss');
  };

  const handleSubmit = () => {
    // 1. Validate complete roster
    if (Object.keys(attendanceData).length !== classmates?.length) {
      Toast.show({ type: 'error', text1: 'Incomplete', text2: 'Please mark an attendance status for every student.' });
      return;
    }

    // 2. Format logs correctly for backend
    const transformedLogs = Object.keys(attendanceData).map(studentId => {
      const record = attendanceData[studentId];
      return {
        student_id: parseInt(studentId, 10),
        status: record.status,
        remarks: record.remarks || null,
        check_in_time: record.check_in_time || ((record.status === 'Present' || record.status === 'Late') 
            ? new Date().toISOString().slice(0, 19).replace('T', ' ') 
            : null)
      };
    });

    // 3. Exact payload backend expects
    const payload = {
      class_session_id: sessionId,
      instructor_time_in: formatTimeForDB(instructorTimeIn),
      instructor_time_out: formatTimeForDB(instructorTimeOut),
      attendance_data: transformedLogs
    };

    submitMutation.mutate(payload, {
      onSuccess: (res) => {
        // RESTORED: Instructor chaining logic
        if (isInstructor) {
          verifyMutation.mutate({ class_session_id: sessionId }, {
            onSuccess: () => {
              Toast.show({ type: 'success', text1: 'Success', text2: 'Attendance submitted and verified!' });
              navigation.goBack();
            },
            onError: () => {
               Toast.show({ type: 'info', text1: 'Partial Success', text2: 'Submitted successfully, but verification failed.' });
               navigation.goBack();
            }
          });
        } else {
          Toast.show({ type: 'success', text1: 'Success', text2: 'Attendance submitted successfully!' });
          navigation.goBack();
        }
      },
      onError: (err) => {
        Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to submit attendance.' });
      }
    });
  };

  if (loadingStudents) return <View className="flex-1 justify-center"><ActivityIndicator color="#4f46e5" /></View>;

  return (
    <Layout title="Attendance Sheet" backButton>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Instructor Section */}
        <View className="bg-indigo-600 p-5 rounded-3xl mb-6">
          <Text className="text-indigo-100 font-poppins-medium text-xs mb-3 uppercase tracking-widest">Instructor Schedule</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={() => { setInstructorTimeIn(new Date()); setActivePicker('in'); setShowPicker(true); }} className="bg-white/20 p-4 rounded-2xl flex-1 mr-2 border border-white/10">
              <Text className="text-white/60 text-xs font-poppins-bold uppercase">Time In</Text>
              <Text className="text-white text-xl font-poppins-semibold">{instructorTimeIn ? format(instructorTimeIn, 'hh:mm a') : 'Not Set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setInstructorTimeOut(new Date()); setActivePicker('out'); setShowPicker(true); }} className="bg-white/20 p-4 rounded-2xl flex-1 border border-white/10">
              <Text className="text-white/60 text-xs font-poppins-bold uppercase">Time Out</Text>
              <Text className="text-white text-xl font-poppins-semibold">{instructorTimeOut ? format(instructorTimeOut, 'hh:mm a') : 'Not Set'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="pt-4 px-1 flex-row justify-end items-center" onPress={() => {setInstructorTimeIn(null); setInstructorTimeOut(null);}}>
            {instructorTimeIn || instructorTimeOut ? (<Circle size={14} color="#fff" />) : (<CircleCheckBig size={14} color="#fff" />)}
            <Text className="ml-1 text-white text-xs font-poppins-medium">Absent</Text>
          </TouchableOpacity>
        </View>

        {/* RESTORED: Mark All Present Header */}
        <View className="flex-row justify-between mb-4 items-center">
          <Text className="text-slate-400 font-poppins-semibold text-xs uppercase tracking-wider pl-1">Students</Text>
          <TouchableOpacity onPress={handleMarkAllPresent} className="bg-emerald-100 py-2 px-4 border border-emerald-300 rounded-full flex-row items-center gap-2">
            <CheckCircle2 size={16} color="#10b981" />
            <Text className="text-emerald-600 font-poppins-medium text-xs">Mark All Present</Text>
          </TouchableOpacity>
        </View>

        {classmates?.map(student => (
          <StudentAttendanceRow 
            key={student.id} 
            student={student} 
            attendance={attendanceData[student.id]} 
            onUpdate={handleUpdateStudent}
          />
        ))}
        <View className="h-24" />
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={activePicker === 'in' ? (instructorTimeIn || new Date()) : (instructorTimeOut || new Date())}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 border-t border-slate-100">
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={submitMutation.isPending || verifyMutation.isPending}
          className="bg-indigo-600 py-4 rounded-2xl items-center flex-row justify-center shadow-md shadow-indigo-300"
        >
          {(submitMutation.isPending || verifyMutation.isPending) && (
            <ActivityIndicator color="#fff" size="small" className="mr-2" />
          )}
          <Text className="text-white font-poppins-semibold text-base">
            {isInstructor ? "Submit & Verify Attendance" : "Save Attendance"}
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

export default ManagementAttendanceScreen;