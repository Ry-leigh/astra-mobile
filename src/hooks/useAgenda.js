import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export const useSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data } = await client.get('/schedules');
      return data.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useEvents = (startDate, endDate) => {
  return useQuery({
    queryKey: ['events', startDate, endDate],
    queryFn: async () => {
      const response = await client.get('/events', {
        params: { start: startDate, end: endDate }
      });
      const rawData = response.data;
      if (rawData && Array.isArray(rawData.events)) return rawData.events;
      if (rawData && Array.isArray(rawData.data)) return rawData.data;
      if (Array.isArray(rawData)) return rawData;
      return []; 
    },
    enabled: !!startDate && !!endDate,
  });
};