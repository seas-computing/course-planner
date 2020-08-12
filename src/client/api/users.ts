import { User } from 'common/classes';
import request from './request';

/**
 * Get the currently authenticated user
 */

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await request.get('/api/users/current');
    return new User(response.data);
  } catch ({ response }) {
    if (
      response.status === 401 && 'loginPath' in response.data
    ) {
      const currentPath = window.location.pathname;
      const { loginPath } = response.data;
      window.location.href = `${process.env.SERVER_URL}/${loginPath}?redirectTo=${currentPath}`;
    }
  }
};
