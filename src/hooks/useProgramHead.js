import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export const useMyPrograms = () => {
  return useQuery({
    queryKey: ['ph-programs'],
    queryFn: async () => {
      const { data } = await client.get('/program-head/programs');
      return data.data;
    },
  });
};

export const useProgramSections = (programId) => {
  return useQuery({
    queryKey: ['ph-sections', programId],
    queryFn: async () => {
      const { data } = await client.get(`/program-head/programs/${programId}/sections`);
      return data.data;
    },
    enabled: !!programId,
  });
};

export const useSectionClasses = (sectionId) => {
  return useQuery({
    queryKey: ['ph-classes', sectionId],
    queryFn: async () => {
      const { data } = await client.get(`/program-head/sections/${sectionId}/classes`);
      return data.data;
    },
    enabled: !!sectionId,
  });
};