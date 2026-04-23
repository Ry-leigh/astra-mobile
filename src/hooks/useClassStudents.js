import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

export const useSubmitAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post('/attendance/bulk-submit', payload); 
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['class-sessions']);
    },
    staleTime: 0,
  });
};

export const useClassStudents = (classId) => {
  return useQuery({
    queryKey: ['class-students', classId],
    queryFn: async () => {
      const { data } = await client.get(`/teaching-assignments/${classId}/enrollees`);
      return data.data;
    },
    enabled: !!classId,
    staleTime: 0,
  });
};

export const useClassSessions = (classId) => {
  return useQuery({
    queryKey: ['class-sessions', classId],
    queryFn: async () => {
      const { data } = await client.get(`/teaching-assignments/${classId}/sessions`);
      return data.data;
    },
    enabled: !!classId,
    staleTime: 0,
  });
};

export const useSessionSnapshot = (sessionId) => {
  return useQuery({
    queryKey: ['session-snapshot', sessionId],
    queryFn: async () => {
      const { data } = await client.get(`/class-sessions/${sessionId}/snapshot`);
      return data.data;
    },
    enabled: !!sessionId,
    staleTime: 0,
  });
};

export const useVerifySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post('/attendance/verify', payload); 
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['class-sessions']);
      queryClient.invalidateQueries(['session-snapshot']);
    },
  });
};

export const useUnverifySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post('/attendance/unverify', payload); 
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['class-sessions']);
      queryClient.invalidateQueries(['session-snapshot']);
    },
  });
};

export const useEnrollStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, studentId }) => {
      const { data } = await client.post(`/teaching-assignments/${classId}/enroll`, { student_id: studentId });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['class-students', variables.classId]);
    },
  });
};

export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, studentId }) => {
      const { data } = await client.delete(`/teaching-assignments/${classId}/unenroll/${studentId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['class-students', variables.classId]);
    },
  });
};

export const useSearchStudents = (classId, searchQuery) => {
  return useQuery({
    // Include searchQuery in the key so it refetches when the user types
    queryKey: ['search-students', classId, searchQuery],
    queryFn: async () => {
      const { data } = await client.get(`/teaching-assignments/${classId}/search-students?q=${searchQuery}`);
      return data.data;
    },
    // Only run the query if there are at least 2 characters to save API calls
    enabled: !!classId && searchQuery.length > 1, 
  });
};