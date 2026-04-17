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
    { id: 'profile', icon: UserIcon, iconColor: '#3b82f6', title: 'Profile', subtitle: 'Manage your personal info', screen: 'Profile' },
    { id: 'notifications', icon: Bell, iconColor: '#f59e0b', title: 'Notifications', subtitle: 'Manage alerts and sounds', screen: 'Notifications' },
    ...(activeRole === 'program_head' ? [{ id: 'management', icon: LayoutGrid, iconColor: '#6366f1', title: 'Management', subtitle: 'Admin controls and oversight', screen: 'Management' }] : []),
    { id: 'settings', icon: SettingsIcon, iconColor: '#64748b', title: 'Settings', subtitle: 'App preferences and theme', screen: 'Settings' },
    { id: 'help', icon: HelpCircle, iconColor: '#6366f1', title: 'Help & Support', subtitle: 'FAQs and contact us', screen: 'Help' },
  ];

  return (
    <Layout title="Account">
      <ScrollView>
        <View className="flex-row items-center p-5 mb-6 border shadow-sm bg-slate-50 rounded-2xl border-slate-100">
          {user.photo ? (
            <Image 
              source={{ uri: user.photo }} 
              className="w-20 h-20 rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center justify-center p-6 bg-indigo-600 rounded-2xl shadow-indigo-200">
              <Text className="font-poppins-semibold text-2xl text-white">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Text>
            </View>
          )}
          
          <View className="flex-1 ml-4">
            <Text className="font-poppins-semibold text-xl text-slate-900">
              {user?.first_name} {user?.last_name}
            </Text>
            
            <Text className="font-poppins text-sm mt-1 text-slate-500">
              {formatRoleName(activeRole)}
            </Text>
          </View>
        </View>

        {roles.length > 1 && (
          <View className="mb-6">
            <Text className="font-poppins-semibold text-[10px] text-slate-400 uppercase tracking-widest p-1">
              Switch Active Role
            </Text>
            
            <View className="flex-row gap-2">
              {roles.map((role) => {
                const isActive = activeRole === role.name;
                
                return (
                  <TouchableOpacity
                    key={role.id}
                    onPress={() => handleRoleSwitch(role.name)}
                    activeOpacity={0.7}
                    className={`px-4 py-2 mt-2 rounded-xl flex-row items-center ${isActive ? "bg-indigo-600 shadow-md shadow-indigo-400" : "bg-white border border-slate-100"}`}>
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

        <View className="overflow-hidden border shadow-sm bg-slate-50 rounded-2xl border-slate-100 mb-8">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(item.screen)}
              className={`flex-row items-center p-4 bg-white active:bg-slate-100 ${
                i !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <View className="items-center justify-center p-3 m-1 rounded-xl bg-slate-50">
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