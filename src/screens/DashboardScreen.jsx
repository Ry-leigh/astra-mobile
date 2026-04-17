import { View, Text } from 'react-native';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

const DashboardScreen = () => {
  const { user } = useAuthStore();

  return (
    <Layout title="Dashboard">
      <View>
        <Text className="text-2xl">Welcome, {user?.first_name}!</Text>
        <Text className="text-gray-400 text-md italic">"She is more precious than rubies: and all the things thou canst desire are not to be compared unto her"</Text>
      </View>
    </Layout>
  );
}

export default DashboardScreen;