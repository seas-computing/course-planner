import request from 'axios';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';

/**
 * Retrieves all faculty for the Faculty Admin tab
 */
export const getAllFacultyMembers = async ():
Promise<ManageFacultyResponseDTO[]> => {
  const response = await request.get('/api/faculty/');
  return response.data;
};

/**
 * Retrieves faculty schedule information for the Faculty tab for specified
 * academic year(s)
 */
export const getFacultySchedulesForYear = async (
  acadYears: number
):
Promise<FacultyResponseDTO[]> => {
  const response = await request
    .get(`/api/faculty/schedule?acadYears=${acadYears}`);
  return response.data;
};
