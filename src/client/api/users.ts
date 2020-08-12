import { User } from 'common/classes';
import request from './request';

/**
 * Get the currently authenticated user
 */

export const getCurrentUser = async (): Promise<User> => {
  const response = await request.get('/api/users/current');
  return new User(response.data);
};
