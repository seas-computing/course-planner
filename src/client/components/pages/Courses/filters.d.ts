import { IS_SEAS, OFFERED } from 'common/constants';

/**
 * Describes the nested level filter fields of the course instance table
 */
export interface SemesterFilterState {
  offered: OFFERED | 'All';
}

/**
 * Describes the top level filter fields of the course instance table
 */
export interface FilterState {
  area: string;
  isSEAS: IS_SEAS | 'All';
  spring: SemesterFilterState;
  fall: SemesterFilterState;
}
