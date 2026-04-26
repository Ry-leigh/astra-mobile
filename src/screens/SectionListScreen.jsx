import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProgramSections } from '../hooks/useProgramHead';
import { Layers, ChevronRight, ChartColumn, Library, GraduationCap, UserCheck } from 'lucide-react-native';

const SectionListScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { programId, abbreviation, program } = route.params;
  const { data: sections, isLoading } = useProgramSections(programId);

  if (isLoading) return <Layout title={`${abbreviation} Sections`} backButton><View className="flex-1 justify-center"><ActivityIndicator color="#4f46e5" /></View></Layout>;

  return (
    <Layout title={`${abbreviation} Sections`} backButton>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text className="text-slate-400 text-center mt-10 font-poppins">No sections found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ClassList', { 
              sectionId: item.id, 
              sectionName: `${abbreviation} ${item.section || ''}` 
            })}
            className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 flex-row items-center"
          >
            <View className="bg-violet-50 p-3 rounded-2xl mr-4">
              <ChartColumn size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-slate-800 text-base">
                {program} {item.section || ''}
              </Text>
              <View className="flex-row items-center mt-2 gap-4">
                <View className="flex-row items-center mt-1">
                  <Library size={12} color="#94a3b8" />
                  <Text className="font-poppins-medium text-slate-400 text-xs ml-1">
                    Year {item.year_level} {/* • Batch {item.graduating_year} */}
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <GraduationCap size={12} color="#94a3b8" />
                  <Text className="font-poppins-medium text-slate-400 text-xs ml-1">x Students</Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <UserCheck size={12} color="#94a3b8" />
                  <Text className="font-poppins-medium text-slate-400 text-xs ml-1">x Courses</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </Layout>
  );
};
export default SectionListScreen;