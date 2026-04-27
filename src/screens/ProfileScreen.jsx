import React, { useState } from 'react';
// import EditUserModal from '../components/organisms/EditUserModal';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Mail, Shield, Trash2, Edit3, User as UserIcon, Calendar, CheckCircle, Clock } from 'lucide-react-native';
import { useUser, useDeleteUser } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import Toast from 'react-native-toast-message';
import EditUserModal from '../components/organisms/EditUserModal';

const ProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, activeRole } = useAuthStore();
  const { mutate: deleteUser } = useDeleteUser();
  
  const targetId = route.params?.userId || user?.id;
  const isOwnProfile = targetId === user?.id;

  const { data: userData, isLoading } = useUser(targetId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayUser = userData || route.params?.initialUser;

  const getRoleBadge = (roles) => {
    const roleName = roles?.[0]?.name || 'student';
    return roleName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to remove access for ${displayUser.first_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteUser(displayUser.id, {
              onSuccess: () => {
                Toast.show({ type: 'success', text1: 'User removed' });
                navigation.goBack();
              },
              onError: (err) => Toast.show({ type: 'error', text1: err.response?.data?.message || 'Error' })
            });
          }
        }
      ]
    );
  };

  if (isLoading && !displayUser) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4f46e5" /></View>;
  }
  return (
    <Layout title="Profile" backButton>
        {/* Profile Card */}
        <View className="pt-2">
          <View className="bg-violet-600 rounded-xl p-6 shadow-sm border border-slate-100 items-center">
            <View className="w-24 h-24 bg-violet-100 rounded-full border-4 border-white shadow-sm overflow-hidden items-center justify-center">
              {displayUser.photo ? (
                <Image source={{ uri: displayUser.photo }} className="w-full h-full" />
              ) : (
                <UserIcon size={40} color="#7c3aed" />
              )}
            </View>

            <Text className="font-poppins-semibold text-xl text-white mt-4">
              {displayUser.first_name} {displayUser.last_name}
            </Text>
            
            <View className="flex-row gap-2 mt-2">
              {displayUser.roles?.map((role, i) => (
                <View key={i} className="bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                  <Text className="text-violet-600 text-xs font-poppins-semibold uppercase tracking-wider">
                    {role.name.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
          {/* Contact Info */}
          <View className="bg-white rounded-3xl p-5 mb-4 border border-slate-100">
            <Text className="text-slate-400 text-xs font-poppins-semibold uppercase mb-4 tracking-widest">Personal Information</Text>
            
            <View className="flex-row items-center mb-4">
              <View className="bg-slate-50 p-2 rounded-xl mr-4">
                <Mail size={18} color="#64748b" />
              </View>
              <View>
                <Text className="text-slate-400 text-[10px] font-poppins uppercase">Email Address</Text>
                <Text className="text-slate-700 font-poppins-medium text-sm">{displayUser.email}</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="bg-slate-50 p-2 rounded-xl mr-4">
                <UserIcon size={18} color="#64748b" />
              </View>
              <View>
                <Text className="text-slate-400 text-[10px] font-poppins uppercase">Gender</Text>
                <Text className="text-slate-700 font-poppins-medium text-sm">{displayUser.sex ? displayUser.sex : 'Not Set'}</Text>
              </View>
            </View>

            {/* <View className="flex-row items-center">
              <View className="bg-slate-50 p-2 rounded-xl mr-4">
                <CheckCircle size={18} color={displayUser.email_verified_at ? "#10b981" : "#f59e0b"} />
              </View>
              <View>
                <Text className="text-slate-400 text-[10px] font-poppins uppercase">Google Auth Status</Text>
                <Text className={`font-poppins-medium text-sm ${displayUser.email_verified_at ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {displayUser.email_verified_at ? 'Verified & Linked' : 'Pending First Login'}
                </Text>
              </View>
            </View> */}
          </View>

          {/* System Meta */}
          <View className="bg-white rounded-3xl p-5 mb-8 border border-slate-100 flex-row justify-between">
              <View className="flex-row items-center">
                  <Calendar size={16} color="#94a3b8" />
                  <Text className="text-slate-500 text-xs font-poppins-regular ml-2">
                      Joined {new Date(displayUser.created_at).toLocaleDateString()}
                  </Text>
              </View>
              {displayUser.google_id && (
                  <View className="flex-row items-center">
                      <Clock size={16} color="#94a3b8" />
                      <Text className="text-slate-500 text-xs font-poppins-regular ml-2">Active</Text>
                  </View>
              )}
          </View>
        </ScrollView>

        {/* Admin Actions Container */}
        {activeRole == 'program_head' && (
          <View className="flex-row gap-3 px-2 py-6 bg-white">
            <TouchableOpacity 
              onPress={() => setIsEditModalOpen(true)}
              className="flex-1 bg-slate-100 h-14 rounded-2xl flex-row items-center justify-center"
            >
              <Edit3 size={20} color="#475569" className="mr-2" />
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-600 text-base">Edit User</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity 
              onPress={handleDelete}
              className="flex-1 bg-red-50 h-14 rounded-2xl flex-row items-center justify-center border border-red-100"
            >
              <Trash2 size={20} color="#ef4444" className="mr-2" />
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-red-600 text-base">Delete</Text>
            </TouchableOpacity> */}
          </View>
        )}

        {(isEditModalOpen) && (
          <TouchableOpacity
            className="absolute inset-0 bg-black/40"
            style={{
              position: 'absolute',
              top: '-100%',
              left: '-100%',
              right: '-100%',
              bottom: '-100%',
              zIndex: 1
            }}
            onPress={() => {closeModal; setIsCreateModalOpen(false);}}
          />
        )}
        
        <Modal
          visible={isEditModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsEditModalOpen(false)}
        >
          <EditUserModal 
            user={displayUser} 
            onClose={() => setIsEditModalOpen(false)} 
          />
        </Modal>
    </Layout>
  );
};

export default ProfileScreen;