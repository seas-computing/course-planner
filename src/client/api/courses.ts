import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { UpdateCourseDTO } from 'common/dto/courses/UpdateCourse.dto';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { TERM } from 'common/constants';
import request from './request';

/**
 * Retrieves all courses
 */
export const getAllCourses = async (): Promise<ManageCourseResponseDTO[]> => {
  const response = await request.get('/api/courses/');
  return response.data as ManageCourseResponseDTO[];
};

/**
 * Submits a POST request to create a new course
 */
const createCourse = async (courseInfo: CreateCourse):
Promise<ManageCourseResponseDTO> => {
  const response = await request.post('/api/courses/', courseInfo);
  return response.data as ManageCourseResponseDTO;
};

/**
 * Edit an existing course entry
 */
const editCourse = async (courseInfo: UpdateCourseDTO):
Promise<ManageCourseResponseDTO> => {
  const response = await request.put(`/api/courses/${courseInfo.id}`, courseInfo);
  return response.data as ManageCourseResponseDTO;
};

/**
 * Retrieve all of the course Instances for a given academicYear.
 */
export const getCourseInstancesForYear = async (
  acadYear: number
): Promise<CourseInstanceResponseDTO[]> => {
  const response = await request
    .get(`/api/course-instances/?acadYear=${acadYear}`);
  return response.data as CourseInstanceResponseDTO[];
};

export const getCourseScheduleForSemester = async (
  calendarYear: number,
  term: TERM
): Promise<ScheduleViewResponseDTO[]> => {
  const response = await request
    .get(`/api/course-instances/schedule?year=${calendarYear}&term=${term}`);
  return response.data as ScheduleViewResponseDTO[];
};

export const CourseAPI = {
  getAllCourses,
  createCourse,
  editCourse,
  getCourseInstancesForYear,
  getCourseScheduleForSemester,
};
