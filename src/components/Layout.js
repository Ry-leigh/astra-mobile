import { StatusBar, View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

const Layout = ({ title = "", children, backButton = false }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const statusBarColor = '#f5f3ff';

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Android status bar */}
      <StatusBar barStyle="dark-content" backgroundColor={statusBarColor} translucent={true} />
      {/* iOS status bar */}
      <View style={{ height: insets.top, backgroundColor: statusBarColor }} />

      {/* Main Container */}
      <View style={{ flex: 1, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
        {/* Header */}
        <View className="px-4 pt-2 pb-4 bg-violet-50 flex-row items-center">
          {backButton && (
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 px-1 -ml-1">
              <ChevronLeft size={30} color="#0f172a" /> 
            </TouchableOpacity>)}
          <Text className="font-poppins-bold text-2xl text-slate-900">{title}</Text>
        </View>
        {/* Content */}
        <View className="flex-1 pt-4 mb-16 px-4">{children}</View>
      </View>
    </View>
  );
}

export default Layout;