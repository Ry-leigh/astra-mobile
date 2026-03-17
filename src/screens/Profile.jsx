import { View, Text } from "react-native";
import Layout from "../components/Layout";

const Profile = () => {
  return (
    <Layout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold m-4">Profile</Text>
      </View>
    </Layout> 
  );
};

export default Profile;
