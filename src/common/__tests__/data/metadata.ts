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
  'Fall 2020',
  'Spring 2021',
  'Fall 2021',
  'Spring 2022',
];

/**
 * Example of the data returned from the /api/metadata endpoint, used for
 * populating certain fields throughout the app.
 */
export const metadata: MetadataResponse = {
  currentAcademicYear,
  areas,
  semesters,
};
