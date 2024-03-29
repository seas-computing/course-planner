import { IS_SEAS, OFFERED } from 'common/constants';

/**
 * Describes the nested level filter fields of the course instance table
 */
export interface SemesterFilterState {
  offered: OFFERED | 'All';
  instructors: string;
}

/**
 * Describes the top level filter fields of the course instance table
 */
export interface FilterState {
  area: string;
  catalogNumber: string;
  title: string;
  isSEAS: IS_SEAS | 'All';
  spring: SemesterFilterState;
  fall: SemesterFilterState;
}

/**
 * Describes the options available for the filter dropdowns in the
 * course instance table
 */
export type FilterOptions = 'area' | 'isSEAS' | 'offered';
