import { User } from 'common/classes';
import { AxiosError } from 'axios';
import request from './request';

/**
 * Get the currently authenticated user
 */

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await request.get('/api/users/current');
    return new User(response.data);
  } catch (err) {
    if ((err as AxiosError).response?.status === 401) {
      window.location.replace(`${process.env.SERVER_URL}/login`);
    } else {
      throw err;
    }
  }
};

/**
 * Export the methods as part of an object so that they are stubbable.
 * See: https://github.com/sinonjs/sinon/issues/562
 */
export const UserAPI = {
  getCurrentUser,
};
