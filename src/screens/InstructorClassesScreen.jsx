// src/screens/InstructorClassesScreen.jsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useMyClasses } from '../hooks/useClasses';
import { BookText, Users, ChevronRight } from 'lucide-react-native';

const InstructorClassesScreen = ({ navigation }) => {
  const { data: classes, isLoading } = useMyClasses();

  if (isLoading) {
    return (
      <Layout title="Classes">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Classes">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={classes}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View className="items-center">
            <Text className="font-poppins-regular text-slate-400">No assigned classes found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ManageClass', { 
              classId: item.id,
              courseName: item.course.course,
              courseCode: item.course.code
            })}
            className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm flex-row items-center"
          >
            <View className="items-center justify-center p-3 m-1 rounded-xl bg-violet-50 mr-4">
              <BookText size={24} color="#8b5cf6" />
            </View>
            
            <View className="flex-1">
              <Text className="font-poppins-semibold text-slate-800 text-base">
                {item.section?.program?.abbreviation} {item.section?.section} • {item.course.code}
              </Text>
              <Text className="font-poppins-medium text-slate-500 text-xs mt-0.5">
                {item.course.course}
              </Text>
              <View className="flex-row items-center mt-2">
                <Users size={12} color="#94a3b8" />
                <Text className="font-poppins-regular text-slate-400 text-xs ml-1">
                  {item.enrollees_count} students
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </Layout>
  );
};

export default InstructorClassesScreen;