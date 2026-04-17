import { StatusBar, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Layout = ({ title="", children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right,}}>
      <StatusBar barStyle="dark-content" />
      <View className="px-4 py-2 mb-1">
        <Text className="font-poppins-bold text-2xl text-slate-900">{title}</Text>
      </View>
      <View className="flex-1 pt-2 px-4">{children}</View>
    </View>
  );
}

export default Layout; 