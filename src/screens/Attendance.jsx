import { View, Text } from 'react-native';
import Layout from '../components/Layout';

const Attendance = () => {
  return (
    <Layout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold m-4">Attendance</Text>
      </View>
    </Layout>
  );
};

export default Attendance;