import { User } from 'common/classes';
import request from './request';

/**
 * Get the currently authenticated user
 */

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await request.get('/api/users/current');
    return new User(response.data);
  } catch (err) {
    if (/401/.test(err)) {
      window.location.replace(`${process.env.SERVER_URL}/login`);
    } else {
      throw err;
    }
  }
};
