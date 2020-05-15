import request from 'axios';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { ManageCourseResponseDTO } from '../../common/dto/courses/ManageCourseResponse.dto';

/**
 * Retrieves all courses
 */
export const getAllCourses = async (): Promise<ManageCourseResponseDTO[]> => {
  const response = await request.get('/api/courses/');
  return response.data;
};

export const getCourseInstancesForYear = async (
  acadYear: number
): Promise<CourseInstanceResponseDTO[][]> => {
  const response = await request
    .get(`/api/course-instances/?acadYear=${acadYear}`);
  return response.data;
};
