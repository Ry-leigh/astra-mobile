import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Modal, TextInput } from 'react-native';
import Layout from '../components/Layout';
import { useEnrollmentDetails } from '../hooks/useEnrollments';
import { useClassStudents, useClassSessions, useUnenrollStudent, useEnrollStudent, useSearchStudents } from '../hooks/useClassStudents';
import { User as UserIcon, ChevronRight, CalendarClock, UserPlus, Trash2, Search, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';

const ManagementClassScreen = ({ route, navigation }) => {
  const { classId, courseName, courseCode } = route.params; 
  const [activeTab, setActiveTab] = useState('Attendance');
  
  const { data: classmates, isLoading: loadingStudents } = useClassStudents(classId);
  const { data: sessions, isLoading: loadingSessions } = useClassSessions(classId);
  
  const enrollMutation = useEnrollStudent();
  const unenrollMutation = useUnenrollStudent();
  const { user, activeRole } = useAuthStore();

  const isInstructor = activeRole === 'instructor' || activeRole === 'program_head';

  const [isEnrollModalVisible, setIsEnrollModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: searchResults, isFetching: isSearching } = useSearchStudents(classId, debouncedSearch);

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
      case 'closed': return { bg: 'bg-slate-100', text: 'text-slate-600' };
      case 'open': return { bg: 'bg-indigo-50', text: 'text-indigo-600' };
      case 'scheduled': return { bg: 'bg-amber-50', text: 'text-amber-600' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600' };
    }
  };

  const openEnrollModal = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedStudentId(null);
    setIsEnrollModalVisible(true);
  };

  const handleEnrollSubmit = () => {
    if (!selectedStudentId) {
      Alert.alert("Selection Required", "Please search and tap a student to select them first.");
      return;
    }

    enrollMutation.mutate({ classId, studentId: selectedStudentId }, {
      onSuccess: () => {
        Alert.alert("Success", "Student enrolled successfully.");
        setIsEnrollModalVisible(false);
      },
      onError: (err) => {
        Alert.alert("Error", err.response?.data?.message || "Could not enroll student.");
      }
    });
  };

  const handleUnenroll = (studentId, studentName) => {
    Alert.alert(
      "Unenroll Student",
      `Are you sure you want to remove ${studentName} from this class? This may delete their attendance records.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Unenroll", 
          style: "destructive",
          onPress: () => unenrollMutation.mutate({ classId, studentId }, {
            onSuccess: () => Alert.alert("Success", "Student removed."),
            onError: (err) => Alert.alert("Error", "Could not remove student.")
          })
        }
      ]
    );
  };

  return (
    <Layout title={`${courseCode}`} backButton>
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
        {activeTab === 'Students' ? (
          <View>
            {/* INSTRUCTOR ONLY: Enroll Button */}
            {isInstructor && (
              <TouchableOpacity 
                onPress={openEnrollModal}
                className="flex-row items-center justify-center bg-indigo-50 py-3 rounded-2xl mb-4 border border-indigo-100"
              >
                <UserPlus size={18} color="#4f46e5" />
                <Text className="font-poppins-semibold text-indigo-600 ml-2">Enroll New Student</Text>
              </TouchableOpacity>
            )}
            {loadingStudents ? (
              <ActivityIndicator color="#4f46e5" className="mt-10" />
            ) : (
              classmates?.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ManageStudentAttendance', {
                    studentId: student.id,
                    classId: classId,
                    studentName: student.fullName
                  })}
                  className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 flex-row items-center shadow-sm"
                >
                  <View className="w-12 h-12 rounded-full bg-slate-50 items-center justify-center mr-4">
                    {student.photo ? (
                      <Image source={{ uri: student.photo }} className="w-12 h-12 rounded-full" />
                    ) : (
                      <UserIcon size={24} color="#94a3b8" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-poppins-semibold text-slate-800 text-base">{student.fullName}</Text>
                      {student.id === user.id && (
                        <View><Text className="font-poppins-medium text-slate-400 text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-md">YOU</Text></View>
                      )}
                    </View>
                    <Text className="font-poppins-regular text-slate-400 text-xs">Tap to view logs</Text>
                  </View>
                  {/* INSTRUCTOR ONLY: Unenroll Button */}
                  {isInstructor ? (
                    <TouchableOpacity 
                      onPress={() => handleUnenroll(student.id, student.fullName)}
                      className="p-2 bg-rose-50 rounded-xl ml-2"
                    >
                      <Trash2 size={18} color="#e11d48" />
                    </TouchableOpacity>
                  ) : (
                    <ChevronRight size={20} color="#cbd5e1" />
                  )}
                </TouchableOpacity>
              ))
            )}
            
            {classmates?.length === 0 && !loadingStudents && (
              <View className="items-center mt-10">
                <Text className="font-poppins-regular text-slate-400">No students found.</Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {loadingSessions ? (
              <ActivityIndicator color="#4f46e5" className="mt-10" />
            ) : (
              sessions?.map((session) => {
                const isOngoing = session.status === 'scheduled' || session.status === 'open';
                const colors = getStatusColor(session.status);
                
                return (
                  <TouchableOpacity
                    key={session.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isOngoing) {
                        navigation.navigate('ManageAttendance', { sessionId: session.id, classId: classId });
                      } else {
                        navigation.navigate('ManageSession', { sessionId: session.id, classId: classId });
                      }
                    }}
                    className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 flex-row items-center justify-between shadow-sm"
                  >
                    <View className="flex-1 mr-2">
                      <Text className="font-poppins-semibold text-slate-800 text-base">
                        {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      <Text className="font-poppins-regular text-slate-400 text-xs mt-0.5">
                        {session.instructor_time_in ? `Started: ${session.instructor_time_in}` : 'Not yet started'}
                      </Text>
                      {session.remarks && (
                        <Text className="font-poppins-medium text-slate-500 text-[10px] mt-1 bg-slate-50 self-start px-2 py-0.5 rounded-md">
                          Topic: {session.remarks}
                        </Text>
                      )}
                    </View>
                    
                    
                      {session.status === "closed" && (activeRole === "instructor" || activeRole === "program_head") ? (
                        <View className={`px-4 py-1.5 rounded-xl bg-yellow-100`}>
                          <Text className={`font-poppins-bold text-[10px] uppercase tracking-widest text-yellow-600`}>
                            Verify
                          </Text>
                        </View>
                      ) : (
                        <View className={`px-4 py-1.5 rounded-xl ${colors.bg}`}>
                          <Text className={`font-poppins-bold text-[10px] uppercase tracking-widest ${colors.text}`}>
                            {session.status}
                          </Text>
                        </View>
                      )}
                  </TouchableOpacity>
                );
              })
            )}

            {sessions?.length === 0 && !loadingSessions && (
              <View className="items-center mt-6 py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                <CalendarClock size={40} color="#cbd5e1" />
                <Text className="font-poppins-regular text-slate-400 mt-2">No class sessions recorded yet.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      {/* NEW: Custom Search & Enroll Modal */}
      <Modal 
        visible={isEnrollModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setIsEnrollModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white w-full max-h-[80%] rounded-3xl p-6 shadow-xl">
            <Text className="font-poppins-semibold text-lg text-slate-800 mb-1">Enroll Student</Text>
            <Text className="font-poppins-regular text-xs text-slate-500 mb-5">
              Search by name, email, or student number.
            </Text>
            
            {/* Search Bar */}
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1 mb-4">
              <Search size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 font-poppins-medium text-slate-800 ml-2 py-2.5"
                placeholder="Search students..."
                placeholderTextColor="#94a3b8"
                value={searchInput}
                onChangeText={setSearchInput}
                autoFocus
              />
              {isSearching && <ActivityIndicator size="small" color="#4f46e5" />}
            </View>

            {/* Search Results List */}
            <ScrollView className="mb-2 flex-grow-0" showsVerticalScrollIndicator={false}>
              {debouncedSearch.length > 1 && searchResults?.length === 0 && !isSearching && (
                 <Text className="font-poppins-regular text-slate-400 text-center py-4 text-xs">
                   No unenrolled students found matching "{debouncedSearch}".
                 </Text>
              )}

              {searchResults?.map(student => (
                <TouchableOpacity
                  key={student.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedStudentId(student.id)}
                  className={`flex-row items-center p-3 rounded-2xl mb-2 border ${
                    selectedStudentId === student.id 
                      ? 'bg-indigo-50 border-indigo-200' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                    {student.photo ? (
                      <Image source={{ uri: student.photo }} className="w-10 h-10 rounded-full" />
                    ) : (
                      <UserIcon size={18} color="#94a3b8" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-poppins-semibold text-sm ${selectedStudentId === student.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {student.fullName}
                    </Text>
                    <Text className="font-poppins-regular text-slate-400 text-[10px]">
                      {student.studentNumber || 'No ID'} • {student.email}
                    </Text>
                  </View>
                  {selectedStudentId === student.id && (
                    <CheckCircle2 size={20} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Footer Actions */}
            <View className="flex-row justify-end gap-4 pt-2">
              <TouchableOpacity 
                onPress={() => setIsEnrollModalVisible(false)} 
                className="px-6 py-3 rounded-xl bg-slate-100"
              >
                <Text className="font-poppins-semibold text-slate-500">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleEnrollSubmit} 
                disabled={enrollMutation.isPending || !selectedStudentId}
                className={`px-6 py-3 rounded-xl flex-row items-center ${
                  !selectedStudentId ? 'bg-indigo-300' : 'bg-indigo-600'
                }`}
              >
                {enrollMutation.isPending && (
                  <ActivityIndicator size="small" color="#fff" className="mr-2" />
                )}
                <Text className="font-poppins-semibold text-white">Enroll Selected</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </Layout>
  );
};

export default ManagementClassScreen;


  const StatusButton = ({ studentId, status, icon, colorClass, activeBgClass }) => {
    const isActive = attendanceData[studentId] === status;
    const icons = {
      P: <CheckCircle2 size={24} color={active ? colorClass : "#94a3b8"} strokeWidth={active ? 1.5 : 1.2} />,
      L: <Clock3 size={24} color={active ? colorClass : "#94a3b8"} strokeWidth={active ? 1.5 : 1.2} />,
      A: <CircleX size={24} color={active ? colorClass : "#94a3b8"} strokeWidth={active ? 1.5 : 1.2} />,
      E: <CircleAlert size={24} color={active ? colorClass : "#94a3b8"} strokeWidth={active ? 1.5 : 1.2} />
    }
    return (
      <TouchableOpacity
        onPress={() => handleStatusChange(studentId, status)}
        className={`flex-1 py-2 mx-1 rounded-xl border items-center justify-center
          ${active ? activeBgClass : 'bg-white border-slate-200'}`}
      >
        <View>
          {icons[icon]}
        </View>
      </TouchableOpacity>
    );
  };