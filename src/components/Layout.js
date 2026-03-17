import { View, StatusBar, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';

const Layout = ({ children }) => {
  const activeRole = useAuthStore((state) => state.activeRole);
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {activeRole && (
        <View className="bg-blue-500 pt-10 pb-1 px-4">
          <Text className="text-white text-[10px] text-center font-bold uppercase tracking-widest">
            Acting as: {activeRole.replace('_', ' ')}
          </Text>
        </View>
      )}
      <View className="flex-1">{children}</View>
    </View>
  );
}

export default Layout;