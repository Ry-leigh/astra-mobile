import { View, Text } from 'react-native';
import Layout from '../components/Layout';

const ProgramsScreen = () => {
  return (
    <Layout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold m-4">Programs</Text>
      </View>
    </Layout>
  );
};

export default ProgramsScreen;