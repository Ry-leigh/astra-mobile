import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <View className="w-[90%] bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex-row items-center shadow-sm">
      <View className="bg-emerald-500/10 p-2 rounded-full mr-3">
        <CheckCircle2 size={20} color="#10b981" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-emerald-800 text-sm">
          {text1}
        </Text>
        {text2 && (
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-emerald-600 text-xs mt-0.5">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),

  error: ({ text1, text2 }) => (
    <View className="w-[90%] bg-rose-50 border border-rose-100 p-4 rounded-2xl flex-row items-center shadow-sm">
      <View className="bg-rose-500/10 p-2 rounded-full mr-3">
        <AlertCircle size={20} color="#ef4444" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-rose-800 text-sm">
          {text1}
        </Text>
        {text2 && (
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-rose-600 text-xs mt-0.5">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),

  info: ({ text1, text2 }) => (
    <View className="w-[90%] bg-blue-50 border border-blue-100 p-4 rounded-2xl flex-row items-center shadow-sm">
      <View className="bg-blue-500/10 p-2 rounded-full mr-3">
        <Info size={20} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-blue-800 text-sm">
          {text1}
        </Text>
        {text2 && (
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-blue-600 text-xs mt-0.5">
            {text2}
          </Text>
        )}
      </View>
    </View>
  )
};