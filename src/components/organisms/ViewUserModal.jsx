import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { X, Mail, Shield, Trash2, Edit3, User as UserIcon } from 'lucide-react-native';
import { useDeleteUser } from '../../hooks/useUsers';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ViewUserModal = ({ user, onClose, onEdit }) => {
  const insets = useSafeAreaInsets();
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const getRoleBadge = (roles) => {
    const roleName = roles?.[0]?.name || 'student';
    return roleName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to remove access for ${user.first_name}? This action cannot be undone if they have no tied records.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteUser(user.id, {
              onSuccess: () => {
                Toast.show({ type: 'success', text1: 'User removed successfully' });
                onClose();
              },
              onError: (error) => {
                const message = error.response?.data?.message || 'Deletion failed due to existing records.';
                Toast.show({ type: 'error', text1: 'Error', text2: message });
              }
            });
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white p-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Profile Header */}
      <View className="bg-indigo-600 pt-12 pb-8 px-6 items-center rounded-xl">
        <TouchableOpacity 
          className="absolute top-12 right-6 bg-white/20 p-2 rounded-full"
          onPress={onClose}
        >
          <X size={20} color="white" />
        </TouchableOpacity>

        {/* Avatar */}
        <View className="w-24 h-24 bg-white rounded-full border-4 border-white/30 overflow-hidden mb-4 items-center justify-center">
          {user.photo ? (
            <Image source={{ uri: user.photo }} className="w-full h-full" />
          ) : (
            <UserIcon size={48} color="#4f46e5" />
          )}
        </View>

        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-2xl text-white">
          {user.first_name} {user.last_name}
        </Text>
        <View className="bg-white/20 px-4 py-1 rounded-full mt-2 flex-row items-center">
          <Shield size={14} color="white" />
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-xs ml-1 uppercase">
            {getRoleBadge(user.roles)}
          </Text>
        </View>
      </View>

      <View className="flex-1 p-8">
        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-400 text-xs uppercase mb-4 tracking-widest">
          Contact Information
        </Text>
        
        <View className="flex-row items-center bg-slate-50 p-4 rounded-2xl mb-8">
          <View className="bg-indigo-100 p-2 rounded-xl mr-4">
            <Mail size={20} color="#4f46e5" />
          </View>
          <View>
            <Text className="text-slate-400 text-xs font-poppins-regular">Primary Email</Text>
            <Text className="text-slate-800 font-poppins-semibold">{user.email}</Text>
          </View>
        </View>

        {/* Status Info */}
        <View className="bg-slate-50 p-4 rounded-2xl flex-row justify-between">
           <View>
              <Text className="text-slate-400 text-xs font-poppins-regular">Status</Text>
              <Text className={user.google_id ? "text-emerald-600 font-poppins-semibold" : "text-amber-600 font-poppins-semibold"}>
                {user.google_id ? 'Linked to Google' : 'Pending Login'}
              </Text>
           </View>
           <View className="items-end">
              <Text className="text-slate-400 text-xs font-poppins-regular">Joined</Text>
              <Text className="text-slate-800 font-poppins-semibold">
                {new Date(user.created_at).toLocaleDateString()}
              </Text>
           </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-4 p-8 border-t border-slate-100 bg-white">
        <TouchableOpacity 
          onPress={onEdit}
          className="flex-1 bg-slate-100 h-14 rounded-2xl flex-row items-center justify-center"
        >
          <Edit3 size={20} color="#64748b" className="mr-2" />
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-600">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleDelete}
          disabled={isPending}
          className="flex-1 bg-red-50 h-14 rounded-2xl flex-row items-center justify-center border border-red-100"
        >
          <Trash2 size={20} color="#ef4444" className="mr-2" />
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-red-600">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewUserModal;