import { UserResponse } from 'common/dto/users/userResponse.dto';
import request from './request';

/**
 * Get the currently authenticated user
 */

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await request.get('/api/users/current');
  return response.data as UserResponse;
};
