import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEvent) => {
      const { data } = await client.post('/events', newEvent);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
    staleTime: 0,
  });
};

export const useManagedTargets = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['targets', user?.id], 
    queryFn: async () => {
      const { data } = await client.get('/targets');
      return data;
    },
    staleTime: 0,
  });
};

export const useUpdateEvent = (eventId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.put(`/events/${eventId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    staleTime: 0,
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId) => {
      const { data } = await client.delete(`/events/${eventId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    staleTime: 0,
  });
};