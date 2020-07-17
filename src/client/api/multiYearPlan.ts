import request from './request';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';

/**
 * Retrieves Multi Year Plan
 */
export const getMultiYearPlan = async ():
Promise<MultiYearPlanResponseDTO[]> => {
  const response = await request.get('/api/course-instances/multi-year-plan');
  return response.data;
};
