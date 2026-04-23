import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useAnnouncements } from '../hooks/useAnnouncements';
import Layout from '../components/Layout';

const AnnouncementsScreen = () => {
  const { data: announcements, isLoading, isError, error } = useAnnouncements();

  if (isLoading) {
    return (
      <Layout title="Announcements">
        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4f46e5" /></View>
      </Layout>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">Error loading announcements: {error.message}</Text>
      </View>
    );
  }

  return (
    <Layout title="Announcements">
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
            <Text className="text-lg font-bold text-gray-900">{item.title}</Text>
            <Text className="text-gray-600 mt-2">{item.description}</Text>
            {/* Add Acknowledgement UI here if item.require_acknowledgement is true */}
          </View>
        )}
      />
    </Layout>
  );
};

export default AnnouncementsScreen;