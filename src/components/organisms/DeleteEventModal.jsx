import React from 'react';
import { View, Text, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Trash2, AlertTriangle } from 'lucide-react-native';
import { useDeleteEvent } from '../../hooks/useEvents';
import Toast from 'react-native-toast-message';

const DeleteEventModal = ({ event, onClose, onDeleted }) => {
  const { mutate: deleteEvent, isLoading } = useDeleteEvent();

  const handleDelete = () => {
    deleteEvent(event.id, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Event Deleted!',
          text2: 'Event has been removed.',
          position: 'top',
        });
        onDeleted();
      },
      onError: (err) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to delete event',
          text2: err.response?.data?.message || 'Check your network connection.',
          position: 'top',
        });
      }
    });
  };

  return (
    <View className="flex-1 justify-center items-center px-6">
      <Pressable className="absolute inset-0 bg-black/60" onPress={onClose} />
      
      <View className="bg-white w-full rounded-3xl p-6 items-center">
        <View className="size-16 bg-rose-100 rounded-full items-center justify-center mb-4">
          <AlertTriangle size={32} color="#e11d48" />
        </View>

        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-xl text-slate-900 text-center">
          Delete Event?
        </Text>
        
        <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-slate-500 text-center mt-2 mb-6">
          Are you sure you want to delete <Text className="font-poppins-bold text-slate-700">"{event.title}"</Text>? This action cannot be undone.
        </Text>

        <View className="flex-row gap-3 w-full">
          <TouchableOpacity 
            onPress={onClose}
            className="flex-1 bg-slate-100 p-4 rounded-2xl items-center"
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-600">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDelete}
            disabled={isLoading}
            className="flex-1 bg-rose-600 p-4 rounded-2xl flex-row items-center justify-center"
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View className="flex-row items-center">
                <Trash2 size={18} color="white" className="mr-2" />
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white ml-2">Delete</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeleteEventModal;