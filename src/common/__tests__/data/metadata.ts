import { TERM } from 'common/constants';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';

/**
 * Example of an academic year
 */
const currentAcademicYear = 2021;

/**
 * Example of a list of academic areas
 */
const areas = ['ACS', 'AM', 'AP', 'BE', 'CS', 'EE', 'ESE', 'General', 'Mat & ME', 'MDE', 'MSMBA', 'SEM'];

/**
 * Example of a list of semesters
 */
const semesters = [
  `${TERM.FALL} 2020`,
  `${TERM.SPRING} 2021`,
  `${TERM.FALL} 2021`,
  `${TERM.SPRING} 2022`,
];

/**
 * Example of a list of catalog prefixes
 */
const catalogPrefixes = ['AC', 'AM', 'AP', 'BE', 'CS', 'ES', 'ESE', 'GENED', 'SEMINAR'];

/**
 * Example of the data returned from the /api/metadata endpoint, used for
 * populating certain fields throughout the app.
 */
export const metadata: MetadataResponse = {
  currentAcademicYear,
  areas,
  semesters,
  catalogPrefixes,
};
