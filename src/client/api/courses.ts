import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { UpdateCourseDTO } from 'common/dto/courses/UpdateCourse.dto';
import request from './request';
import { ManageCourseResponseDTO } from '../../common/dto/courses/ManageCourseResponse.dto';

/**
 * Retrieves all courses
 */
const getAllCourses = async (): Promise<ManageCourseResponseDTO[]> => {
  const response = await request.get('/api/courses/');
  return response.data as ManageCourseResponseDTO[];
};

/**
 * Submits a POST request to create a new course
 */
const createCourse = async(courseInfo: CreateCourse):
Promise<ManageCourseResponseDTO> => {
  const response = await request.post('/api/course', courseInfo);
  return response.data as ManageCourseResponseDTO;
};

/**
 * Edit an existing course entry
 */
const editCourse = async (courseInfo: UpdateCourseDTO):
Promise<ManageCourseResponseDTO> => {
  const response = await request.put(`api/course/${courseInfo.id}`, courseInfo);
  return response.data as ManageCourseResponseDTO;
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
  createCourse,
  editCourse,
  getCourseInstancesForYear,
};
