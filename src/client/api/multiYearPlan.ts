import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import request from './request';

/**
 * Retrieves Multi Year Plan
 */
const getMultiYearPlan = async ():
Promise<MultiYearPlanResponseDTO[]> => {
  const response = await request.get('/api/course-instances/multi-year-plan');
  return response.data as MultiYearPlanResponseDTO[];
};

export const MultiYearPlanAPI = {
  getMultiYearPlan,
};
