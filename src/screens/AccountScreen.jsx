import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { User as UserIcon, Settings as SettingsIcon, HelpCircle, LogOut, Bell, ChevronRight, LayoutGrid, Pencil, PencilRuler, FilePen, Workflow, RefreshCw } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';

const AccountScreen = ({ navigation }) => {
  const { user, roles, activeRole, setActiveRole, logout } = useAuthStore();

  const handleRoleSwitch = (roleName) => {
    if (roleName === activeRole) return;

    setActiveRole(roleName);

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  const formatRoleName = (name) => {
    if (!name) return '';
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRoleIcon = (name, size = 16, color = "currentColor") => {
    switch (name) {
      case 'student': return <Pencil size={size} color={color} />;
      case 'class_officer': return <PencilRuler size={size} color={color} />;
      case 'instructor': return <FilePen size={size} color={color} />;
      case 'program_head': return <Workflow size={size} color={color} />;
      default: return <RefreshCw size={size} color={color} />;
    }
  };

  const menuItems = [
    { id: 'profile', icon: UserIcon, iconColor: '#6d28d9', title: 'Profile', subtitle: 'Your personal information', screen: 'Profile' },
    { id: 'notifications', icon: Bell, iconColor: '#6d28d9', title: 'Notifications', subtitle: 'Manage your notifications', screen: 'Notifications' },
    ...(activeRole === 'program_head' ? [{ id: 'management', icon: LayoutGrid, iconColor: '#6d28d9', title: 'Management', subtitle: 'App user management', screen: 'Management' }] : []),
    { id: 'settings', icon: SettingsIcon, iconColor: '#6d28d9', title: 'Settings', subtitle: 'App preferences and theme', screen: 'Settings' },
    { id: 'help', icon: HelpCircle, iconColor: '#6d28d9', title: 'Help & Support', subtitle: 'FAQs', screen: 'Help' },
  ];

  return (
    <Layout title="Account">
      <ScrollView>
        <View className="flex-row items-center p-5 mb-6 border border-slate-200 bg-slate-50 rounded-2xl">
          {user.photo ? (
            <Image 
              source={{ uri: user.photo }} 
              className="w-20 h-20 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center justify-center p-7 bg-violet-700 rounded-full">
              <Text className="font-poppins-semibold text-2xl text-white">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Text>
            </View>
          )}
          
          <View className="flex-1 ml-4">
            <Text className="font-poppins-semibold text-xl text-slate-900">
              {user?.first_name} {user?.last_name}
            </Text>
            <Text className="font-poppins-medium text-xs mt-1 text-slate-500">
              {formatRoleName(activeRole)}
            </Text>
            <Text className="font-poppins-medium text-xs mt-1 text-slate-500">
              {user.email}
            </Text>
          </View>
        </View>

        {roles.length > 1 && (
          <View className="mb-6">
            <Text className="font-poppins-semibold text-[10px] text-slate-400 uppercase tracking-widest pl-1">
              Switch Role
            </Text>
            
            <View className="flex-row gap-2">
              {roles.map((role) => {
                const isActive = activeRole === role.name;
                
                return (
                  <TouchableOpacity
                    key={role.id}
                    onPress={() => handleRoleSwitch(role.name)}
                    activeOpacity={0.7}
                    className={`px-4 py-2 mt-2 rounded-xl flex-row items-center ${isActive ? "bg-violet-700 border border-violet-100" : "bg-white border border-slate-100"}`}>
                    {typeof getRoleIcon === 'function' && (
                      <View className="mr-2">
                        {getRoleIcon(role.name, 12, isActive ? "white" : undefined)}
                      </View>
                    )}

                    <Text className={`text-sm font-poppins-bold ${isActive ? "text-white" : "text-slate-500 "}`}>
                      {typeof formatRoleName === 'function' ? formatRoleName(role.name) : role.name.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View className="overflow-hidden border border-slate-100 bg-slate-50 rounded-2xl mb-8">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(item.screen)}
              className={`flex-row items-center p-4 bg-white active:bg-slate-100 ${
                i !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <View className="items-center justify-center p-3 m-1 rounded-xl bg-violet-50">
                <item.icon size={24} color={item.iconColor} />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-poppins-semibold text-md text-slate-900">{item.title}</Text>
                <Text className="font-poppins text-xs text-slate-500">{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={logout} className="flex-row items-center justify-center w-full py-4 mb-12 rounded-2xl bg-rose-50 active:bg-rose-600">
          <LogOut size={18} color="#e11d48" />
          <Text className="font-poppins-bold ml-2 text-rose-600">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
};

export default AccountScreen;