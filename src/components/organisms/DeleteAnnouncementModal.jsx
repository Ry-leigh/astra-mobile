import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, KeyboardAvoidingView } from 'react-native';
import { X, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDeleteAnnouncement } from '../../hooks/useAnnouncements';

const DeleteAnnouncementModal = ({ announcement, onClose }) => {
  const insets = useSafeAreaInsets();
  const { mutate: deleteAnnouncement, isLoading } = useDeleteAnnouncement();
  const [confirmText, setConfirmText] = useState('');

  const isConfirmed = confirmText === 'DELETE';

  const handleDelete = () => {
    if (!isConfirmed) return;
    deleteAnnouncement(announcement.id, { 
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Announcement has been removed.',
          position: 'top',
        });
        onClose();
      },
      onError: () => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to delete announcement.',
          position: 'top',
        });
      }
    });
  };

  return (
    <View className="flex-1 justify-center items-center m-8" style={{ paddingBottom: insets.bottom }}>
      <Pressable className="absolute inset-0" onPress={onClose} />

      <KeyboardAvoidingView behavior="padding" className="bg-white overflow-hidden rounded-3xl w-full">
        <View className="p-6 pb-8 gap-4">
          
          <View className="flex-row justify-between items-start">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="bg-rose-100 p-3 pt-2.5 rounded-full">
                <AlertTriangle size={20} color="#e11d48" />
              </View>
              <Text className="flex-1 font-poppins-semibold text-lg text-slate-900">Delete Announcement</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <Text className="font-poppins text-slate-700 mb-2 text-lg">
            "{announcement?.title}"
          </Text>
          <Text className="font-poppins-medium text-slate-700 text-sm">
            Type <Text className="font-poppins-bold text-rose-600">DELETE</Text> to confirm
          </Text>
          
          <TextInput 
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-lg font-poppins-bold tracking-widest"
            placeholder="DELETE"
            placeholderTextColor="#cbd5e1"
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="characters"
          />

          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={onClose} 
              className="flex-1 bg-slate-100 p-4 rounded-2xl items-center"
            >
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-600">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleDelete} 
              disabled={!isConfirmed || isLoading} 
              className={`flex-1 p-4 rounded-2xl items-center ${isConfirmed && !isLoading ? 'bg-rose-600' : 'bg-rose-300'}`}
            >
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">
                {isLoading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default DeleteAnnouncementModal;