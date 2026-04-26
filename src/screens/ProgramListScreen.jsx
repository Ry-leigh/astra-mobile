import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useMyPrograms } from '../hooks/useProgramHead';
import { ChartColumn, GraduationCap, Layers, UserCheck, ChevronRight } from 'lucide-react-native';

const ProgramListScreen = ({ navigation }) => {
  const { data: programs, isLoading } = useMyPrograms();

  if (isLoading) return <Layout title="My Programs"><View className="flex-1 justify-center"><ActivityIndicator color="#4f46e5" /></View></Layout>;

  return (
    <Layout title="My Programs">
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text className="text-slate-400 text-center mt-10 font-poppins">No programs found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SectionList', { programId: item.id, abbreviation: item.abbreviation, program: item.program })}
            className="bg-white p-5 rounded-3xl mb-4 border border-slate-100 flex-row items-center"
          >
            <View className="bg-violet-50 p-3 rounded-xl mr-4">
              <ChartColumn size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-slate-800 text-base">{item.program}</Text>
              <View className="flex-row items-center mt-2 gap-4">
                <View className="flex-row items-center mt-1">
                  <Layers size={12} color="#94a3b8" />
                  <Text className="font-poppins-medium text-slate-400 text-xs ml-1">x Sections</Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <GraduationCap size={12} color="#94a3b8" />
                  <Text className="font-poppins-medium text-slate-400 text-xs ml-1">x Students</Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <UserCheck size={12} color="#94a3b8" />
                  <Text className="font-poppins-medium text-slate-400 text-xs ml-1">x Faculty</Text>
                </View>
              </View>
            </View>
            {/* <ChevronRight size={20} color="#cbd5e1" /> */}
          </TouchableOpacity>
        )}
      />
    </Layout>
  );
};
export default ProgramListScreen;