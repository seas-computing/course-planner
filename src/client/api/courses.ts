import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import request from './request';
import { ManageCourseResponseDTO } from '../../common/dto/courses/ManageCourseResponse.dto';

/**
 * Retrieves all courses
 */
const getAllCourses = async (): Promise<ManageCourseResponseDTO[]> => {
  const response = await request.get('/api/courses/');
  return response.data as ManageCourseResponseDTO[];
};

const getCourseInstancesForYear = async (
  acadYear: number
): Promise<CourseInstanceResponseDTO[][]> => {
  const response = await request
    .get(`/api/course-instances/?acadYear=${acadYear}`);
  return response.data as CourseInstanceResponseDTO[][];
};

export const CourseAPI = {
  getAllCourses,
  getCourseInstancesForYear,
};
