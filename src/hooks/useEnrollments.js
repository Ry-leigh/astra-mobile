import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

export const useMyEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const { data } = await client.get('/enrollments');
      return data.data;
    },
    staleTime: 0,
  });
};

export const useEnrollmentDetails = (teachingAssignmentId) => {
  return useQuery({
    queryKey: ['enrollment', teachingAssignmentId],
    queryFn: async () => {
      const { data } = await client.get(`/enrollments/${teachingAssignmentId}`);
      return data.data;
    },
    enabled: !!teachingAssignmentId,
    staleTime: 0,
  });
};

export const useStudentClassDetails = (classId, studentId) => {
  return useQuery({
    queryKey: ['student-class-details', classId, studentId],
    queryFn: async () => {
      const { data } = await client.get(`/enrollments/${classId}/${studentId}`);
      return data.data;
    },
    enabled: !!classId && !!studentId,
    staleTime: 0,
  });
};