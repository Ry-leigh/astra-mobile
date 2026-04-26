import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { X, Calendar, Clock, Edit2, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO, parse } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import Toast from 'react-native-toast-message';

const ViewEventModal = ({ event, onClose, onEdit, onDelete }) => {
  const insets = useSafeAreaInsets();
  const activeRole = useAuthStore((state) => state.activeRole);
    const iconColor = {
    suspension: '#e11d48',
    school: '#2563eb',
    exam: '#6d28d9',
    holiday: '#059669',
    makeup: '#4f46e5',
    default: '#594c5b'
  }

  const iconBg = {
    suspension: 'bg-rose-50',
    school: 'bg-blue-50',
    exam: 'bg-violet-50',
    holiday: 'bg-emerald-100',
    makeup: 'bg-indigo-50',
    default: 'bg-mauve-50'
  }

  const textStyles = {
    suspension: 'text-rose-600',
    school: 'text-blue-600',
    exam: 'text-violet-700',
    holiday: 'text-emerald-600',
    makeup: 'text-indigo-600',
    default: 'text-mauve-600'
  }

  // Logic for All Day vs. Time Range
  const isEventAllDay = event.start_time === '00:00:00' && event.end_time === '23:59:59';
  
  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '';
    const parsedTime = parse(timeStr.substring(0, 5), 'HH:mm', new Date());
    return format(parsedTime, 'h:mm a');
  };

  const timeDisplay = isEventAllDay 
    ? "ALL DAY" 
    : `${formatDisplayTime(event.start_time)} - ${formatDisplayTime(event.end_time)}`;

  const dateDisplay = event.start_date 
    ? format(parseISO(event.start_date), 'MMMM d, yyyy') 
    : '';

  return (
    <View className="flex-1 justify-end" style={{ paddingBottom: insets.bottom }}>
      <Pressable className="absolute inset-0" onPress={onClose} />

      <View className="bg-white rounded-t-3xl overflow-hidden p-6" style={{ height: '70%' }}>
          {/* Header Section */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-row items-center">
              <View className={`p-3 rounded-2xl mr-4 ${iconBg[event.type?.toLowerCase() || 'default']}`}>
                <Calendar size={24} color={iconColor[event.type?.toLowerCase() || 'default']} />
              </View>
              <View className="">
                <View className="flex-row">
                  <Text className={`font-poppins-bold text-lg uppercase tracking-widest ${textStyles[event.type?.toLowerCase() || 'default']}`}>
                    {event.type || 'Event'}
                  </Text>
                </View>
                <Text className="font-poppins-semibold text-xs text-slate-500 uppercase tracking-widest">
                  Details
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-50 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text 
              style={{ fontFamily: 'Poppins_700Bold' }} 
              className="text-2xl text-slate-900 mb-4 leading-tight"
            >
              {event.title}
            </Text>

            {/* Date and Time Info Row */}
            <View className="flex-row items-center flex-wrap gap-6 mb-8">
              <View className="flex-row items-center">
                <Calendar size={16} color="#94a3b8"/>
                <Text className="font-poppins-semibold ml-2 mr-4 text-slate-400 text-sm uppercase">
                  {dateDisplay}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Clock size={16} color="#94a3b8" />
                <Text className="font-poppins-semibold ml-2 text-slate-400 text-sm uppercase">
                  {timeDisplay}
                </Text>
              </View>
            </View>

            {/* Description Box */}
            <View className="bg-slate-50 p-6 rounded-[24px] mb-8 border border-slate-100">
              <Text className="font-poppins text-slate-600 leading-6 text-[15px]">
                {event.description || "No description provided."}
              </Text>
            </View>

          </ScrollView>

          {activeRole === 'program_head' && (
            <View className="flex-row justify-end items-center gap-2 pb-4">
              <TouchableOpacity 
                onPress={() => {
                    onClose();
                    onEdit(event);
                }} 
                className="flex-row items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 mr-4"
              >
                <Edit2 size={18} color="#64748b" />
                <Text className="font-poppins-semibold ml-2 text-slate-500">
                  Edit Event
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {onClose(); onDelete(event)}} 
                className="flex-row items-center px-4 py-2 bg-rose-50 rounded-xl border border-rose-100"
              >
                <Trash2 size={18} color="#f43f5e" />
                <Text className="font-poppins-semibold ml-2 text-rose-500">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
    </View>
  );
};

export default ViewEventModal;