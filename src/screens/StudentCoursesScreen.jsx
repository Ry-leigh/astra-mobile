import { View, Text } from 'react-native';
import Layout from '../components/Layout';

const StudentCoursesScreen = () => {
  return (
    <Layout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold m-4">Courses</Text>
      </View>
      <View className="flex-1 m-20 bg-green-500 items-center justify-center"></View>
    </Layout>
  );
};

export default StudentCoursesScreen;