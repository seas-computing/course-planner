import { UserResponse } from 'common/dto/users/userResponse.dto';
import request, { AxiosPromise } from './request';

/**
 * Get the currently authenticated user
 */

export const getCurrentUser = (): AxiosPromise<UserResponse> => request.get('/api/users/current');
