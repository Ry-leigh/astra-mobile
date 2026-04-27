import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { X, UserPlus, Mail, ShieldCheck } from 'lucide-react-native';
import { useCreateUser } from '../../hooks/useUsers';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROLES = [
  { label: 'Program Head', value: 'program_head' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Class Officer', value: 'class_officer' },
  { label: 'Student', value: 'student' },
];

const CreateUserModal = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { mutate: createUser, isPending } = useCreateUser();
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'student',
  });

  const handleSubmit = () => {
    if (!form.email || !form.first_name || !form.last_name) {
      return Toast.show({ type: 'error', text1: 'All fields are required' });
    }

    createUser(form, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: 'User authorized successfully' });
        onClose();
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to create user';
        Toast.show({ type: 'error', text1: message });
      }
    });
  };

  return (
    <View className="flex-1 justify-end" style={{ paddingBottom: insets.bottom }}>
      <Pressable className="absolute inset-0" onPress={onClose} />
      <KeyboardAvoidingView behavior="padding" className="bg-white rounded-t-3xl overflow-hidden" style={{ height: '70%' }}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
          <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-xl text-slate-800">Authorize User</Text>
          <TouchableOpacity onPress={onClose}><X size={24} color="#64748b" /></TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <Text className="text-slate-500 font-poppins-regular mb-6">
            Pre-register a user. They must use this exact email when logging in via Google.
          </Text>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-slate-700 font-poppins-semibold mb-2 ml-1">Gmail Address</Text>
            <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-200">
              <Mail size={20} color="#94a3b8" />
              <TextInput 
                className="flex-1 py-3 ml-2 font-poppins-medium text-slate-800"
                placeholder="user@laverdad.edu.ph"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(val) => setForm({...form, email: val})}
              />
            </View>
          </View>

          {/* Name Row */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-700 font-poppins-semibold mb-2 ml-1">First Name</Text>
              <TextInput 
                className="bg-slate-50 py-3 rounded-2xl px-4 border border-slate-200 font-poppins-medium text-slate-800"
                value={form.first_name}
                onChangeText={(val) => setForm({...form, first_name: val})}
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-700 font-poppins-semibold mb-2 ml-1">Last Name</Text>
              <TextInput 
                className="bg-slate-50 py-3 rounded-2xl px-4 border border-slate-200 font-poppins-medium text-slate-800"
                value={form.last_name}
                onChangeText={(val) => setForm({...form, last_name: val})}
              />
            </View>
          </View>

          {/* Role Dropdown */}
          <View className="mb-8">
            <Text className="text-slate-700 font-poppins-semibold mb-2 ml-1">Assign Primary Role</Text>
            <Dropdown
              style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' }}
              placeholderStyle={{ color: '#94a3b8', fontFamily: 'Poppins_400Regular' }}
              selectedTextStyle={{ color: '#1e293b', fontFamily: 'Poppins_500Medium' }}
              data={ROLES}
              labelField="label"
              valueField="value"
              value={form.role}
              onChange={item => setForm({...form, role: item.value})}
              renderLeftIcon={() => <ShieldCheck size={20} color="#4f46e5" style={{ marginRight: 8 }} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View className="p-6 bg-white">
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isPending}
          className={`h-14 rounded-2xl flex-row items-center justify-center ${isPending ? 'bg-indigo-400' : 'bg-indigo-600'}`}
        >
          <UserPlus size={20} color="white" className="mr-2" />
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-lg">
            {isPending ? 'Processing...' : 'Authorize User'}
          </Text>
        </TouchableOpacity>
        </View>
    </View>
  );
};

export default CreateUserModal;