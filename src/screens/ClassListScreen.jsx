import { View, Text } from 'react-native';
import Layout from '../components/Layout';

const ClassListScreen = () => {
  return (
    <Layout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold m-4">Classes</Text>
      </View>
    </Layout>
  );
};

export default ClassListScreen;