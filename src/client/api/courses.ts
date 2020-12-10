import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
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

export const getCourseInstancesForYear = async (
  acadYear: number
): Promise<CourseInstanceResponseDTO[][]> => {
  const response = await request
    .get(`/api/course-instances/?acadYear=${acadYear}`);
  return response.data as CourseInstanceResponseDTO[][];
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
  getCourseInstancesForYear,
  getCourseScheduleForSemester,
};
