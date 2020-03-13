import request from 'axios';
import { ManageCourseResponseDTO } from '../../common/dto/courses/ManageCourseResponse.dto';

/**
 * Retrieves all courses
 */
export const getAllCourses = async (): Promise<ManageCourseResponseDTO[]> => {
  const response = await request.get('/api/courses/');
  return response.data;
};
