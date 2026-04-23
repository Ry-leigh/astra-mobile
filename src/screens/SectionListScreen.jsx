import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProgramSections } from '../hooks/useProgramHead';
import { Layers, ChevronRight } from 'lucide-react-native';

const SectionListScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { programId, abbreviation } = route.params;
  const { data: sections, isLoading } = useProgramSections(programId);

  if (isLoading) return <Layout title={`${abbreviation} Sections`} backButton><View className="flex-1 justify-center"><ActivityIndicator color="#4f46e5" /></View></Layout>;

  return (
    <Layout title={`${abbreviation} Sections`} backButton>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text className="text-slate-400 text-center mt-10 font-poppins-regular">No sections found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ClassList', { 
              sectionId: item.id, 
              sectionName: `${abbreviation} ${item.section || ''}` 
            })}
            className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm flex-row items-center"
          >
            <View className="bg-indigo-50 p-3 rounded-2xl mr-4">
              <Layers size={24} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-slate-800 text-base">
                {abbreviation} {item.section || ''}
              </Text>
              <Text className="font-poppins-regular text-slate-400 text-xs mt-0.5">
                Year Level: {item.year_level} • Batch {item.graduating_year}
              </Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </Layout>
  );
};
export default SectionListScreen;