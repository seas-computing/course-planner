import request from 'axios';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';

/**
 * Retrieves all faculty
 */
export const getAllFacultyMembers = async ():
Promise<ManageFacultyResponseDTO[]> => {
  const response = await request.get('/api/faculty/');
  return response.data;
};
