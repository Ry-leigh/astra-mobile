import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { X, Save, Mail, Shield } from 'lucide-react-native';
import { useUpdateUser } from '../../hooks/useUsers';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROLES = [
  { label: 'Program Head', value: 'program_head' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Class Officer', value: 'class_officer' },
  { label: 'Student', value: 'student' },
];

const EditUserModal = ({ user, onClose }) => {
  const insets = useSafeAreaInsets();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [form, setForm] = useState({
    email: user.email,
    role: user.roles?.[0]?.name || 'student',
  });

  const handleUpdate = () => {
    updateUser({ id: user.id, ...form }, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: 'User updated successfully' });
        onClose();
      },
      onError: (err) => Toast.show({ type: 'error', text1: 'Update failed' })
    });
  };

  return (
    <View className="flex-1 justify-end" style={{ paddingBottom: insets.bottom }}>
      <Pressable className="absolute inset-0" onPress={onClose} />
      <KeyboardAvoidingView behavior="padding" className="bg-white rounded-t-3xl overflow-hidden" style={{ height: '70%' }}>
        <View className="bg-white rounded-t-xl p-6 pb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-xl text-slate-800">Edit User</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-slate-500 font-poppins-semibold text-xs uppercase ml-1 mb-2">Email</Text>
            <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-200">
              <Mail size={18} color="#94a3b8" />
              <TextInput 
                className="flex-1 py-4 ml-2 font-poppins-medium text-slate-800"
                value={form.email}
                onChangeText={(val) => setForm({...form, email: val})}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-slate-500 font-poppins-semibold text-xs uppercase ml-1 mb-2">Role</Text>
            <Dropdown
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' }}
              placeholderStyle={{ color: '#94a3b8', fontFamily: 'Poppins_400Regular' }}
              selectedTextStyle={{ color: '#1e293b', fontFamily: 'Poppins_500Medium' }}
              data={ROLES}
              labelField="label"
              valueField="value"
              value={form.role}
              onChange={item => setForm({...form, role: item.value})}
              renderLeftIcon={() => <Shield size={18} color="#7c3aed" style={{ marginRight: 8 }} />}
            />
          </View>

          
        </View>
      </KeyboardAvoidingView>
      <View className="p-6 bg-white">
        <TouchableOpacity 
          onPress={handleUpdate}
          disabled={isPending}
          className={`p-4 rounded-2xl flex-row items-center justify-center ${isPending ? 'bg-violet-400' : 'bg-violet-600'}`}
        >
          <Save size={20} color="white" className="mr-2" />
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-lg">
            {isPending ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditUserModal;