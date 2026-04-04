import { View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Layout = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right,}}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export default Layout;