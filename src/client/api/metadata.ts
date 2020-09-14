import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import request from './request';

/**
 * Get the current metadata
 */
const getMetadata = async (): Promise<MetadataResponse> => {
  const response = await request.get('/api/metadata/');
  return response.data as MetadataResponse;
};

export const MetadataAPI = {
  getMetadata,
};
