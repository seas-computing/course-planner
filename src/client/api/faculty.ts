import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { CreateFacultyDTO } from 'common/dto/faculty/CreateFaculty.dto';
import { UpdateFacultyDTO } from 'common/dto/faculty/UpdateFaculty.dto';
import request from './request';

/**
 * Retrieves all faculty for the Faculty Admin tab
 */
export const getAllFacultyMembers = async ():
Promise<ManageFacultyResponseDTO[]> => {
  const response = await request.get('/api/faculty/');
  return response.data as ManageFacultyResponseDTO[];
};

/**
 * Submits a POST request to create a new faculty for the Faculty Admin tab
 */
export const createFaculty = async (facultyInfo: CreateFacultyDTO):
Promise<ManageFacultyResponseDTO> => {
  const response = await request.post('/api/faculty', facultyInfo);
  return response.data;
};

/**
 * Edit an existing faculty member entry
 */
export const editFaculty = async (facultyInfo: UpdateFacultyDTO):
Promise<ManageFacultyResponseDTO> => {
  const response = await request.put(`/api/faculty/${facultyInfo.id}`, facultyInfo);
  return response.data;
};

/**
 * Retrieves faculty schedule information for the Faculty tab for specified
 * academic year(s)
 */
export const getFacultySchedulesForYear = async (
  acadYears: number
):
Promise<Record<string, FacultyResponseDTO[]>> => {
  const response = await request
    .get(`/api/faculty/schedule?acadYears=${acadYears}`);
  return response.data as Record<string, FacultyResponseDTO[]>;
};
