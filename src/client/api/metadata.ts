import request, { AxiosPromise } from 'axios';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

/**
 * Get the current metadata
 */
export const getMetadata = (): AxiosPromise<MetadataResponse> => request.get('/api/metadata');
