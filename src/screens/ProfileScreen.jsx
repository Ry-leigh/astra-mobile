import { View, Text } from 'react-native';
import Layout from '../components/Layout';

const ProfileScreen = () => {
  return (
    <Layout title="Profile" backButton>
      <View>
        <Text>Profile</Text>
      </View>
    </Layout>
  );
};

export default ProfileScreen;