import { createContext } from 'react';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

export type MetadataContextValue = {
  value: MetadataResponse,
  update: (metadata: MetadataResponse) => void,
};

/**
 * Manage the current metadata through Context
 */
export const MetadataContext = createContext<MetadataContextValue>(null);
