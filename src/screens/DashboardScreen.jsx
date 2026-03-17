import { View, Text } from 'react-native';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

const DashboardScreen = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <Layout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold m-4">Welcome, {user?.first_name}!</Text>
        <Text className="text-gray-500">hehehe</Text>
      </View>
    </Layout>
  );
}

export default DashboardScreen;