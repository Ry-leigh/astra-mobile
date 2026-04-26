import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import Layout from '../components/Layout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSessionSnapshot, useVerifySession, useUnverifySession } from '../hooks/useClassStudents'; // Updated imports
import { CheckCircle2, User as UserIcon, Edit2, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import client from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore'; // Needed for role checks
import { format, parse } from 'date-fns';

const ManagementSessionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { activeRole } = useAuthStore(); // Get the current role
  const { sessionId, classId } = route.params;

  const { data: snapshot, isLoading } = useSessionSnapshot(sessionId);
  const verifyMutation = useVerifySession();
  const unverifyMutation = useUnverifySession();

  const isInstructor = activeRole === 'instructor' || activeRole === 'program_head';

  // Quickly tally the statuses for the summary header
  const stats = useMemo(() => {
    if (!snapshot?.logs) return { Present: 0, GracePresent: 0, Late: 0, Absent: 0, Excused: 0, Suspended: 0 };
    return snapshot.logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {});
  }, [snapshot]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': 
      case 'Grace Present': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Late': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Absent': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Suspended': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const handleEditAttendance = async () => {
    try {
      await client.post('/class-sessions/reopen', { session_id: sessionId });
      queryClient.invalidateQueries(['class-sessions']);
      navigation.replace('ManageAttendance', { sessionId, classId });
    } catch (error) {
      Alert.alert("Error", "Could not reopen session.");
    }
  };

  const handleVerify = () => {
    Alert.alert("Verify Session", "Are you sure? This will finalize the attendance and apply any necessary penalties.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Verify", 
        style: "default",
        onPress: () => verifyMutation.mutate({ class_session_id: sessionId }, {
          onSuccess: (res) => Alert.alert("Success", res.message),
          onError: (err) => Alert.alert("Error", err.response?.data?.message || "Failed to verify.")
        })
      }
    ]);
  };

  const handleUnverify = () => {
    Alert.alert("Undo Verification", "This will move the snapshot back to editable logs and revert penalties. Continue?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Unverify", 
        style: "destructive",
        onPress: () => unverifyMutation.mutate({ class_session_id: sessionId }, {
          onSuccess: (res) => Alert.alert("Success", res.message),
          onError: (err) => Alert.alert("Error", err.response?.data?.message || "Failed to unverify.")
        })
      }
    ]);
  };

  if (isLoading) {
    return (
      <Layout title="Session Details" backButton>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#4f46e5" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Session Details" backButton>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Verification Receipt Header */}
        <View className="bg-indigo-600 p-6 rounded-3xl mb-6">
          <Text className="font-poppins-semibold text-white text-lg mb-2">
            {new Date(snapshot?.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          <View className="gap-1 mb-1">
            {/* <CheckCircle2 size={12} color="#fff" />
            <Text className="font-poppins text-indigo-100 ml-1 text-sm">
              {!snapshot?.verifier && !snapshot?.verified_at ? "Submitted Session" : "Verified Session"}
            </Text> */}
            <Text className="font-poppins text-indigo-100 ml-1 text-sm">Time In: {format(parse(snapshot?.time_in, 'HH:mm:ss', new Date()), 'hh:mm aa')}</Text>
            <Text className="font-poppins text-indigo-100 ml-1 text-sm">Time Out: {format(parse(snapshot?.time_out, 'HH:mm:ss', new Date()), 'hh:mm aa')}</Text>
          </View>
          {snapshot?.remarks && (
            <Text className="font-poppins text-indigo-100 mb-1">
              Remarks: {snapshot?.remarks}
            </Text>
          )}
          <View className="h-[1px] bg-indigo-400/50 my-3" />
          <Text className="font-poppins-it text-indigo-200 text-xs">
            {snapshot?.verifier && snapshot?.verified_at && (
                `Verified by ${snapshot?.verifier} on ${snapshot?.verified_at}`
            )}  
            {!snapshot?.verifier && !snapshot?.verified_at && snapshot?.marked_by && snapshot?.marked_at && (
                `Marked by ${snapshot?.marked_by} on ${snapshot?.marked_at}`
            )}
          </Text>
        </View>

        {/* Action Buttons Container */}
        <View className="mb-6 flex-row gap-3">
          
          {/* Edit Button: Visible to Class Officers and Instructors if session is closed */}
          {snapshot?.session_status === 'closed' && (
            <TouchableOpacity 
              onPress={handleEditAttendance}
              className="flex-1 flex-row items-center justify-center bg-indigo-50 py-3 rounded-2xl border border-indigo-100"
            >
              <Edit2 size={16} color="#4f46e5" />
              <Text className="font-poppins-semibold text-indigo-600 ml-2">Edit Session</Text>
            </TouchableOpacity>
          )}

          {/* INSTRUCTOR ONLY: Verify Button */}
          {isInstructor && snapshot?.session_status === 'closed' && (
            <TouchableOpacity 
              onPress={handleVerify}
              disabled={verifyMutation.isPending}
              className="flex-1 flex-row items-center justify-center bg-emerald-500 py-3 rounded-2xl"
            >
              {verifyMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <ShieldCheck size={16} color="#fff" />}
              <Text className="font-poppins-semibold text-white ml-2">Verify Session</Text>
            </TouchableOpacity>
          )}

          {/* INSTRUCTOR ONLY: Undo Verification Button */}
          {isInstructor && snapshot?.session_status === 'verified' && (
            <TouchableOpacity 
              onPress={handleUnverify}
              disabled={unverifyMutation.isPending}
              className="flex-1 flex-row items-center justify-center bg-rose-50 py-3 rounded-2xl border border-rose-100"
            >
              {unverifyMutation.isPending ? <ActivityIndicator color="#e11d48" size="small" /> : <ShieldAlert size={16} color="#e11d48" />}
              <Text className="font-poppins-semibold text-rose-600 ml-2">Undo Verification</Text>
            </TouchableOpacity>
          )}

        </View>

        {/* Quick Summary Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 items-center">
            <Text className="font-poppins-semibold text-emerald-500 text-xl">{stats.Present + (stats.GracePresent ? stats.GracePresent : 0) || 0}</Text>
            <Text className="font-poppins text-slate-400 text-[10px] uppercase">Present</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 items-center">
            <Text className="font-poppins-semibold text-amber-500 text-xl">{stats.Late || 0}</Text>
            <Text className="font-poppins text-slate-400 text-[10px] uppercase">Late</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 items-center">
            <Text className="font-poppins-semibold text-rose-500 text-xl">{stats.Absent + (stats.Suspended ? stats.Suspended : 0) || 0}</Text>
            <Text className="font-poppins text-slate-400 text-[10px] uppercase">Absent</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 items-center">
            <Text className="font-poppins-semibold text-blue-500 text-xl">{stats.Excused || 0}</Text>
            <Text className="font-poppins text-slate-400 text-[10px] uppercase">Excused</Text>
          </View>
        </View>

        {/* The Snapshot Logs */}
        <Text className="font-poppins-semibold text-slate-400 text-xs uppercase mb-4 tracking-widest">
          Class Roster Snapshot
        </Text>

        {snapshot?.logs?.map((log) => {
          const colors = getStatusColor(log.status);
          
          return (
            <View key={log.student_id} className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                {log.photo ? (
                  <Image source={{ uri: log.photo }} className="w-10 h-10 rounded-full" />
                ) : (
                  <UserIcon size={20} color="#94a3b8" />
                )}
              </View>
              
              <View className="flex-1">
                <Text className="font-poppins-semibold text-slate-800 text-sm">
                  {log.student_name}
                </Text>
                {log.check_in_time && (
                  <Text className="font-poppins text-slate-400 text-[10px] mt-0.5">
                    Check-in: {log.check_in_time}
                  </Text>
                )}
              </View>

              <View className={`px-3 py-1.5 rounded-xl border ${colors}`}>
                <Text className={`font-poppins-bold text-[10px] uppercase tracking-widest ${colors}`}>
                  {log.status}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Layout>
  );
};

export default ManagementSessionScreen;
// the courses->class->[session_id] screen of a class officer or higher, lists the logs