import { useQuery } from "@tanstack/react-query";
import client from "../api/client";

export const useAbsenceTrends = () => {
  return useQuery({
    queryKey: ['dashboard', 'absenceTrends'],
    queryFn: async () => {
      const response = await client.get('/dashboard/program-head/absence-trends');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 15,
  });
};

export const useSectionRankings = () => {
  return useQuery({
    queryKey: ['dashboard', 'sectionRankings'],
    queryFn: async () => {
      const response = await client.get('/dashboard/program-head/section-rankings');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 15,
  });
};

export const useAnnouncementCompliance = () => {
  return useQuery({
    queryKey: ['dashboard', 'announcementCompliance'],
    queryFn: async () => {
      const response = await client.get('/dashboard/program-head/announcement-compliance');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useInstructorSessions = () => {
  return useQuery({
    queryKey: ['dashboard', 'instructorSessions'],
    queryFn: async () => {
      const response = await client.get('/dashboard/instructor/active-sessions');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useInstructorAbsenceTrends = () => {
  return useQuery({
    queryKey: ['dashboard', 'instructorAbsenceTrends'],
    queryFn: async () => {
      const response = await client.get('/dashboard/instructor/absence-trends');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 15,
  });
};