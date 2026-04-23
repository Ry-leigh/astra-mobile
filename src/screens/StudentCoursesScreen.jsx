import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useMyEnrollments } from '../hooks/useEnrollments';
import { BookOpen, User, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';   
import { useAuthStore } from '../store/authStore';

const StudentCoursesScreen = () => {
  const { data: enrollments, isLoading } = useMyEnrollments();
  const [activeTab, setActiveTab] = useState(null);
  const navigation = useNavigation();
  const { activeRole } = useAuthStore();

  const semesters = useMemo(() => {
    if (!enrollments) return [];
    
    const unique = {};
    enrollments.forEach(item => {
      const sem = item.teachingAssignment.semester;
      const id = sem.id;
      if (!unique[id]) {
        unique[id] = {
          id,
          label: `${sem.term === 1 ? '1st' : '2nd'} Sem`,
          year: sem.year,
        };
      }
    });
    
    const sorted = Object.values(unique).sort((a, b) => a.id - b.id);
    
    if (sorted.length > 0 && !activeTab) {
      setActiveTab(sorted[0].id);
    }
    
    return sorted;
  }, [enrollments]);

  const filteredData = useMemo(() => {
    if (!enrollments || !activeTab) return [];
    return enrollments.filter(e => e.teachingAssignment.semester.id === activeTab);
  }, [enrollments, activeTab]);

  if (isLoading) {
    return (
      <Layout title="Courses">
        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4f46e5" /></View>
      </Layout>
    );
  }

  return (
    <Layout title="Courses">
      <View className="flex-row">
          {semesters.map((sem) => {
            const isActive = activeTab === sem.id;
            return (
              <TouchableOpacity
                key={sem.id}
                onPress={() => setActiveTab(sem.id)}
                className={`flex-1 mr-3 px-5 py-2 rounded-2xl border items-center ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
              >
                <Text className={isActive ? 'font-poppins-semibold text-white' : 'font-poppins-medium text-slate-500'}>
                  {sem.label}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        className="mt-4"
        renderItem={({ item }) => {
          const { teachingAssignment } = item;
          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => navigation.navigate(activeRole === 'student' ? 'Class' : 'ManageClass', { 
                classId: teachingAssignment.id,
                courseName: teachingAssignment.course.name,
                courseCode: teachingAssignment.course.code
              })}
              className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm flex-row items-center"
            >
              <View className="bg-indigo-50 p-3 rounded-2xl mr-4">
                <BookOpen size={24} color="#4f46e5" />
              </View>
              
              <View className="flex-1 gap-1">
                <Text className="font-poppins-semibold text-slate-800 text-base">
                  {teachingAssignment.course.name}
                </Text>
                <View className="flex-row items-center">
                  <User size={12} color="#94a3b8" />
                  <Text className="font-poppins-regular text-slate-500 text-xs ml-2">
                    {teachingAssignment.instructor.fullName}
                  </Text>
                </View>
                <Text className="font-poppins-regular text-slate-400 text-xs">
                  {teachingAssignment.section.program} {teachingAssignment.section.name}
                </Text>
                
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          );
        }}
      />
    </Layout>
  );
};

export default StudentCoursesScreen;