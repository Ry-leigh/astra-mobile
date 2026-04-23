import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useMyPrograms } from '../hooks/useProgramHead';
import { GraduationCap, ChevronRight } from 'lucide-react-native';

const ProgramListScreen = ({ navigation }) => {
  const { data: programs, isLoading } = useMyPrograms();

  if (isLoading) return <Layout title="My Programs"><View className="flex-1 justify-center"><ActivityIndicator color="#4f46e5" /></View></Layout>;

  return (
    <Layout title="My Programs">
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text className="text-slate-400 text-center mt-10 font-poppins-regular">No programs found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SectionList', { programId: item.id, abbreviation: item.abbreviation })}
            className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 shadow-sm flex-row items-center"
          >
            <View className="bg-indigo-50 p-3 rounded-2xl mr-4">
              <GraduationCap size={24} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-slate-800 text-base">{item.abbreviation}</Text>
              <Text className="font-poppins-regular text-slate-400 text-xs mt-0.5">{item.program}</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </Layout>
  );
};
export default ProgramListScreen;