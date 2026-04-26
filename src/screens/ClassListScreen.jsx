import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSectionClasses } from '../hooks/useProgramHead';
import { BookOpen, User, ChevronRight } from 'lucide-react-native';

const ClassListScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sectionId, sectionName } = route.params;
  const { data: classes, isLoading } = useSectionClasses(sectionId);

  if (isLoading) return <Layout title={sectionName} backButton><View className="flex-1 justify-center"><ActivityIndicator color="#4f46e5" /></View></Layout>;

  return (
    <Layout title={sectionName} backButton>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text className="text-slate-400 text-center mt-10 font-poppins">No classes found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ManageClass', { 
              classId: item.id,
              courseName: item.course.course,
              courseCode: item.course.code
            })}
            className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 flex-row items-center"
          >
            <View className="bg-indigo-50 p-3 rounded-2xl mr-4">
              <BookOpen size={24} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-slate-800 text-base">
                {item.course.course}
              </Text>
              <Text className="font-poppins text-slate-400 text-xs mt-0.5 mb-1">
                {item.course.code} • {item.units} Units
              </Text>
              <View className="flex-row items-center">
                <User size={12} color="#94a3b8" />
                <Text className="font-poppins-medium text-slate-500 text-[10px] ml-1">
                   Instructor: {item.instructor?.first_name} {item.instructor?.last_name}
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
export default ClassListScreen;