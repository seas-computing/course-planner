import request from 'axios';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

/**
 * Get the current metadata
 */
export const getMetadata = async (): Promise<MetadataResponse> => {
  const response = await request.get('/api/metadata/');
  return response.data;
};
