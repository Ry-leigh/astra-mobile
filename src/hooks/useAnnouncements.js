import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await client.get('/announcements');
      return response.data.data;
    },
    staleTime: 0,
  });
};