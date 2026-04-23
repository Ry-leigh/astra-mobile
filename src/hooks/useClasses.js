import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export const useMyClasses = () => {
  return useQuery({
    queryKey: ['my-classes'],
    queryFn: async () => {
      const { data } = await client.get('/my-teaching-assignments');
      return data.data;
    },
  });
};