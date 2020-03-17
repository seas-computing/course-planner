import request from 'axios';
import { FacultyResponseDTO } from '../../common/dto/faculty/facultyResponse.dto';

/**
 * Retrieves all faculty
 */
export const getAllFaculty = async (): Promise<FacultyResponseDTO[]> => {
  const response = await request.get('/api/faculty');
  return response.data;
};
