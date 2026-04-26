import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await client.get('/announcements');
      return response.data.data;
    },
    staleTime: 1000 * 10,
  });
};

export const useAnnouncementTargets = () => {
  return useQuery({
    queryKey: ['announcementTargets'],
    queryFn: async () => {
      const response = await client.get('/announcements/create');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, 
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload) => {
      const response = await client.post('/announcements', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const response = await client.put(`/announcements/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await client.delete(`/announcements/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useAcknowledgeAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId) => {
      const response = await client.post(`/announcements/${announcementId}/acknowledge`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
    },
  });
};