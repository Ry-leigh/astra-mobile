import React from 'react'; 
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Edit2, Trash2, CheckCircle, Megaphone, Clock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useAcknowledgeAnnouncement } from '../../hooks/useAnnouncements';
import Toast from 'react-native-toast-message';
import { format, parseISO } from 'date-fns';

const ViewAnnouncementModal = ({ announcement, onClose, onEdit, onDelete, onAcknowledge }) => {
  const insets = useSafeAreaInsets();
  const activeRole = useAuthStore((state) => state.activeRole);
  const { mutate: acknowledge, isLoading } = useAcknowledgeAnnouncement();

  const handleAcknowledge = () => {
    acknowledge(announcement.id, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Acknowledged',
          text2: 'Thank you for reading this announcement.',
        });
        onClose();
      },
      onError: () => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Could not process acknowledgement. Please try again.',
        });
      }
    });
  };

  if (!announcement) return null;

  return (
    <View className="flex-1 justify-end" style={{ paddingBottom: insets.bottom }}>
      <Pressable className="absolute inset-0" onPress={onClose} />

      <View className="bg-white rounded-t-3xl overflow-hidden" style={{ height: '70%' }}>
        {/* Header Actions */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-2">
          <View className="flex-row items-center">
              <View className={`p-3 rounded-2xl mr-4 bg-violet-50`}>
                <Megaphone size={24} color="#6d28d9" />
              </View>
              <View className="">
                  <Text className="font-poppins-bold text-lg uppercase tracking-widest text-slate-900">
                    Announcement
                  </Text>
                <Text className="font-poppins-semibold text-xs text-slate-500 uppercase tracking-widest">
                  Details
                </Text>
              </View>
            </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="p-6">
          <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-2xl text-slate-900 mb-2">
            {announcement.title}
          </Text>
          
         <View className="flex-row items-center gap-2 mb-4">
            <Clock color="#64748b" size={12} />
            <Text className="font-poppins-semibold text-slate-500 text-[10px]">{format(parseISO(announcement.created_at), 'MMM dd, yyyy  •  h:mm a')}</Text>
          </View>

          {/* Description Box */}
          <View className="bg-slate-50 p-6 rounded-[24px] mb-8 border border-slate-100">
            <Text 
              style={{ fontFamily: 'Poppins_400Regular' }} 
              className="text-slate-600 leading-6 text-[15px]"
            >
              {announcement.description || "No description provided."}
            </Text>
          </View>
        </ScrollView>

        {activeRole === 'program_head' && (
          <View className="flex-row justify-end items-center gap-2 pb-2 mr-6">
            <TouchableOpacity onPress={() => onEdit(announcement)} className="flex-row items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 mr-4">
              <Edit2 size={18} color="#64748b" />
              <Text className="font-poppins-semibold ml-2 text-slate-500">
                Edit Event
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onDelete(announcement)} className="flex-row items-center px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
              <Trash2 size={18} color="#f43f5e" />
              <Text className="font-poppins-semibold ml-2 text-rose-500">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Action Area (Acknowledgement) */}
        {announcement.require_acknowledgement && (
          <View className="mt-4">
            {!announcement.is_acknowledged ? (
              <View>
                <Text className="text-slate-500 text-sm mb-3 text-center">
                  Please confirm you have read this announcement.
                </Text>
                <TouchableOpacity
                  onPress={handleAcknowledge}
                  disabled={isLoading}
                  className={`flex-row items-center justify-center p-4 rounded-2xl mx-6 mb-6 ${
                    isLoading ? 'bg-violet-400' : 'bg-violet-700'
                  }`}
                >
                  {!isLoading && <CheckCircle size={20} color="white" />}
                  <Text className="font-poppins-semibold text-white text-base ml-2 uppercase">
                    {isLoading ? 'Processing...' : 'Acknowledge Announcement'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-center justify-center mx-6 mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <View className="bg-emerald-100 p-1 rounded-full mr-2">
                  <CheckCircle size={16} color="#059669" />
                </View>
                <Text className="font-poppins-semibold text-emerald-700 text-base">
                  Acknowledged
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ViewAnnouncementModal;