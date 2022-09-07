import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { UpdateCourseDTO } from 'common/dto/courses/UpdateCourse.dto';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { TERM } from 'common/constants';
import CourseInstanceUpdateDTO from 'common/dto/courses/CourseInstanceUpdate.dto';
import { RoomScheduleResponseDTO } from 'common/dto/schedule/roomSchedule.dto';
import request from './request';
import { InstructorResponseDTO } from '../../common/dto/courses/InstructorResponse.dto';
import { InstructorRequestDTO } from '../../common/dto/courses/InstructorRequest.dto';

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

/**
 * Given a room id, calendar year, and term, this will retrieve the course
 * information for the courses that will occur in the requested room and
 * semester.
 */
export const getRoomScheduleForSemester = async (
  roomId: string,
  calendarYear: number,
  term: TERM
): Promise<RoomScheduleResponseDTO[]> => {
  const response = await request
    .get(`/api/course-instances/room-schedule?roomId=${roomId}&term=${term}&year=${calendarYear}`);
  return response.data as RoomScheduleResponseDTO[];
};

/**
 * Update the list of instructors associated with a course instance
 */
export const updateInstructorList = async (
  id: string,
  instructors: InstructorRequestDTO[]
): Promise<InstructorResponseDTO[]> => {
  const response = await request
    .put(`/api/course-instances/${id}/instructors`, { instructors });
  return response.data as InstructorResponseDTO[];
};

/**
 * Edit an existing course instance
 */
export const updateCourseInstance = async (
  id: string,
  instance: CourseInstanceUpdateDTO
):Promise<CourseInstanceUpdateDTO> => {
  const response = await request.put(`/api/course-instances/${id}`, instance);
  return response.data as CourseInstanceUpdateDTO;
};

export const CourseAPI = {
  getAllCourses,
  createCourse,
  editCourse,
  getCourseInstancesForYear,
  getCourseScheduleForSemester,
  updateInstructorList,
  updateCourseInstance,
  getRoomScheduleForSemester,
};
