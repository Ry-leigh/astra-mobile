import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useAnnouncements } from '../hooks/useAnnouncements';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { Megaphone, Plus, Users, Book, Bell, Clock, MegaphoneOff } from 'lucide-react-native';
import CreateAnnouncementModal from '../components/organisms/CreateAnnouncementModal';
import ViewAnnouncementModal from '../components/organisms/ViewAnnouncementModal';
import EditAnnouncementModal from '../components/organisms/EditAnnouncementModal';
import DeleteAnnouncementModal from '../components/organisms/DeleteAnnouncementModal';
import { parseISO, format } from 'date-fns';

const AnnouncementsScreen = () => {
  const { activeRole } = useAuthStore();
  const { width, height } = Dimensions.get('window');
  const { data: announcements, isLoading, isError, error } = useAnnouncements();
  const [activeTab, setActiveTab] = useState('General');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  // 1. Define tabs dynamically based on activeRole
  const tabs = useMemo(() => {
    if (activeRole === 'student' || activeRole === 'class_officer') {
      return [{name: 'General', icon: Megaphone}, {name: 'Program', icon: Users}, {name: 'Section', icon: Book}];
    }
    if (activeRole === 'instructor') {
      return [{name: 'General', icon: Megaphone}, {name: 'Faculty', icon: Users}, {name: 'Class', icon: Book}];
    }
    if (activeRole === 'program_head') {
      return [{name: 'General', icon: Megaphone}, {name: 'Faculty', icon: Users}, {name: 'Program', icon: Book}];
    }
    return [{name: 'General', icon: Megaphone}]; // Fallback
  }, [activeRole]);

  // Ensure activeTab resets if the user switches roles and the current tab disappears
  useEffect(() => {
    if (!tabs.some(tab => tab.name === activeTab)) {
      setActiveTab(tabs[0].name);
    }
  }, [tabs, activeTab]);

  // 2. Filter announcements based on activeTab and activeRole
  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];

    return announcements.filter((item) => {
      const isGlobal = !item.targets || item.targets.length === 0;

      if (activeTab === 'General') {
        if (isGlobal) return true;
        // Include role-based targets for students/officers
        if ((activeRole === 'student' || activeRole === 'class_officer') && 
            item.targets.some(t => t.targetable_type === 'role')) {
          return true;
        }
        return false;
      }

      if (activeTab === 'Program') {
        return item.targets.some(t => t.targetable_type === 'program');
      }

      if (activeTab === 'Faculty') {
        // Faculty tab catches role targets for instructors and program heads
        return item.targets.some(t => t.targetable_type === 'role');
      }

      if (activeTab === 'Section') {
        return item.targets.some(t => t.targetable_type === 'section' || t.targetable_type === 'teaching_assignment');
      }

      if (activeTab === 'Class') {
        return item.targets.some(t => t.targetable_type === 'teaching_assignment');
      }

      return false;
    });
  }, [announcements, activeTab, activeRole]);
  
  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setActiveModal('view');
  };

  const handleEditRequest = (announcement) => {
    // Closes view, opens edit
    setActiveModal('edit'); 
  };

  const handleDeleteRequest = (announcement) => {
    // Closes view, opens delete
    setActiveModal('delete'); 
  };

  const closeModal = () => {
    setActiveModal(null);
    // Don't clear selectedAnnouncement immediately so exit animations stay smooth
    setTimeout(() => setSelectedAnnouncement(null), 300); 
  };

  if (isLoading) {
    return (
      <Layout title="Announcements">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout title="Announcements" style={{ overflow: 'visible' }}>
      <View className="flex-row mb-4 bg-violet-50 p-1 rounded-xl">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name} onPress={() => setActiveTab(tab.name)}
            className={`flex-1 flex-row gap-2 py-2 justify-center items-center rounded-lg ${activeTab === tab.name ? 'bg-white' : ''}`}
          >
            <tab.icon color={activeTab === tab.name ? '#6d28d9' : '#4b5563'} size={20} />
            <Text className={`font-poppins-semibold ${activeTab === tab.name ? 'text-violet-700' : 'text-gray-600'}`}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {filteredAnnouncements.length > 0 ? (
      <FlatList
        data={filteredAnnouncements}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className={`bg-white p-5 rounded-2xl mb-4 border border-slate-200/70 ${item.require_acknowledgement && !item.is_acknowledged ? 'pt-8' : ''}`}
            activeOpacity={0.7}
            onPress={() => openViewModal(item)} 
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center bg-violet-50 p-3 rounded-xl">
                <Bell color="#6d28d9" size={28} />
              </View>
              <View className="flex-1 ml-4 gap-1">
                <Text className="font-poppins-bold text-gray-900 text-lg/6">{item.title}</Text>
                <View className="flex-row items-center gap-2">
                  <Clock color="#64748b" size={12} />
                  <Text className="font-poppins-semibold text-slate-500 text-[10px]">{format(parseISO(item.created_at), 'MMM dd, yyyy  •  h:mm a')}</Text>
                </View>
              </View>
            </View>
            
            <Text className="text-gray-600 mt-2 font-poppins" numberOfLines={2}>{item.description}</Text>
            {item.require_acknowledgement && !item.is_acknowledged && (
              <View className="absolute top-0 right-0 bg-rose-500 self-start px-3 py-1 rounded-tr-2xl rounded-bl-2xl">
                 <Text className="text-white text-xs font-poppins-medium">Requires Acknowledgement</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      ) : (
        <View className="flex-1 mt-12 items-center">
          <MegaphoneOff color="#94a3b8" size={32} strokeWidth={1.5}/>
          <Text className="font-poppins-medium text-slate-400 mt-4 text-sm">No announcements found</Text>
        </View>
      )}

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

      {/* Floating Action Button (Only show if user has permission to create) */}
      {(activeRole === 'instructor' || activeRole === 'program_head') && (
        <TouchableOpacity 
          onPress={() => setIsCreateModalOpen(true)}
          className="absolute bottom-6 right-6 size-16 bg-violet-700 rounded-2xl items-center justify-center"
        >
          <Plus color="white" size={28} />
        </TouchableOpacity>
      )}

      {/* Modals */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <CreateAnnouncementModal onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
      
      <Modal
        visible={activeModal === 'view'}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <ViewAnnouncementModal 
          announcement={selectedAnnouncement} 
          onClose={closeModal} 
          onEdit={handleEditRequest} 
          onDelete={handleDeleteRequest} 
          onAcknowledge={(id) => console.log('Acknowledged', id)} 
        />
      </Modal>

      <Modal
        visible={activeModal === 'edit'}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <EditAnnouncementModal announcement={selectedAnnouncement} onClose={closeModal} />
      </Modal>

      <Modal
        visible={activeModal === 'delete'}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <DeleteAnnouncementModal announcement={selectedAnnouncement} onClose={closeModal} />
      </Modal>
    </Layout>
  );
};

export default AnnouncementsScreen;