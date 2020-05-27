import { createContext, Context } from 'react';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

/**
 * Manage the current metadata through Context
 */
export const MetadataContext: Context<MetadataResponse> = createContext(null);
