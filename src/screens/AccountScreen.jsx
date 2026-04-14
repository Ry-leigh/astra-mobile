import { View, Text, TouchableOpacity } from "react-native";
import Layout from "../components/Layout";
import { useAuthStore } from '../store/authStore';
import client from "../api/client";

const AccountScreen = () => {
const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      const response = await client.post('/logout'); 
      console.log(response.data);
    } catch (error) {
      console.error("Server-side logout failed, but clearing local state anyway.");
    } finally {
      useAuthStore.getState().logout();
    }
  };

  return (
    <Layout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold m-4">{user?.first_name} {user?.last_name}</Text>
        <Text className="text-gray-500">{user?.email}</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg mt-4"
        >
          <Text className="text-white">Logout</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

export default AccountScreen;
