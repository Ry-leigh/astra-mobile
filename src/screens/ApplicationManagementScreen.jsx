import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image, Modal } from 'react-native';
import { Plus, Search, Shield, User as UserIcon } from 'lucide-react-native';
import Layout from '../components/Layout';
import { useUsers } from '../hooks/useUsers';
import CreateUserModal from '../components/organisms/CreateUserModal';
import { useNavigation } from '@react-navigation/native';

const ApplicationManagementScreen = () => {
  const navigation = useNavigation();
  const { data: users, isLoading, isError } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'view', 'edit', 'delete', null

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery) return users;
    
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(lowerQuery) ||
      user.first_name.toLowerCase().includes(lowerQuery) ||
      user.last_name?.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  const openViewModal = (user) => {
    setSelectedUser(user);
    setActiveModal('view');
  };

  const closeModal = () => {
    setActiveModal(null);
    setTimeout(() => setSelectedUser(null), 300);
  };

  const getRoleDisplay = (role) => {
  if (!role) return 'No Role';
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

  if (isLoading) {
    return (
      <Layout title="User Management">
        <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#4f46e5" /></View>
      </Layout>
    );
  }

  return (
    <Layout title="User Management" backButton>
      {/* Search Bar */}
      <View className="bg-slate-50 flex-row items-center px-4 py-1 rounded-2xl border border-slate-200 mb-4">
        <Search size={20} color="#94a3b8" />
        <TextInput 
          className="flex-1 ml-2 font-poppins-medium text-slate-800"
          placeholder="Search by name or email..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-center text-slate-500 font-poppins-medium mt-10">No users found.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 flex-row items-center"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Profile', { 
              userId: item.id,
              initialUser: item // Pass initial data for instant UI
            })}
          >
            {/* Avatar Placeholder */}
            <View className="w-12 h-12 bg-violet-50 rounded-full items-center justify-center mr-4">
              {item.photo ? (
                <Image source={{ uri: item.photo }} className="w-12 h-12 rounded-full" />
              ) : (
                <Text className="font-poppins-bold text-xs text-violet-700">{item.first_name.charAt(0).toUpperCase() + item.last_name.charAt(0).toUpperCase()}</Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-base font-poppins-semibold text-slate-800">
                {item.first_name} {item.last_name}
              </Text>
              <Text className="text-slate-500 font-poppins-regular text-xs" numberOfLines={1}>
                {item.email}
              </Text>
              <View className="flex-row gap-2 mt-2">
                {item.roles.map((role, index) => (
                <View key={index} className="bg-violet-100 px-2 py-1 rounded-lg flex-row items-center">
                  <Text className="text-violet-700 font-poppins text-xs">
                    {getRoleDisplay(role.name)}
                  </Text>
                </View>
              ))}
              </View>
            </View>

            <View className={`p-2 rounded-lg border border-slate-200 flex-row items-center ${item.email_verified_at ? "bg-emerald-50" : "bg-slate-50"}`}>
              <Shield size={12} color={item.email_verified_at ? "#22c55e" : "#64748b"} className="mr-1" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => setIsCreateModalOpen(true)}
        className="absolute bottom-6 right-6 size-16 bg-violet-700 rounded-2xl items-center justify-center"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      {(isCreateModalOpen || activeModal) && (
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
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <CreateUserModal onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </Layout>
  );
};

export default ApplicationManagementScreen;