import { TERM } from 'common/constants';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import { CampusResponse } from 'common/dto/room/CampusResponse.dto';

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
 * Example of campuses along with their building and room information
 */
const campuses: CampusResponse[] = [
  {
    id: '0badd038-a4d1-4e29-8a60-e2092f110e33',
    name: 'Allston',
    buildings: [
      {
        id: 'def023e0-d47a-4346-bdfb-bf7daed9e18d',
        name: 'SEC',
        rooms: [
          {
            id: '18e44241-ecb5-4fa7-b857-60d4cc76bb83',
            name: '211',
            capacity: 75,
          },
          {
            id: 'bf1f7364-b53a-49f6-a8e5-393b770d1ede',
            name: '150',
            capacity: 40,
          },
        ],
      },
      {
        id: '2de0aaac-dc6e-4871-acc5-7569d2a72548',
        name: '114 Western Ave',
        rooms: [
          {
            id: 'a6040e74-ddfe-4995-a66c-9586fb12e2e9',
            name: '101B',
            capacity: 100,
          },
        ],
      },
    ],
  },
  {
    id: '4d8f7196-1d46-4e2d-9461-fd1c618aba3b',
    name: 'Cambridge',
    buildings: [
      {
        id: '40853f0e-1185-4871-9b8b-f4b73750a9ad',
        name: 'Maxwell Dworkin',
        rooms: [
          {
            id: 'ec635477-d92f-4ebd-a3a1-322c899488e3',
            name: '201A',
            capacity: 75,
          },
          {
            id: 'bf1f7364-b53a-49f6-a8e5-393b770d1ede',
            name: '202A',
            capacity: 150,
          },
        ],
      },
      {
        id: '2d545f2e-ebc7-48d2-a7e3-59bb120233a2',
        name: 'Pierce Hall',
        rooms: [
          {
            id: 'f9e810d1-a825-452c-9a58-8d9ce15b778f',
            name: '108B',
            capacity: 35,
          },
          {
            id: 'c67e066f-b0c5-4997-987d-9b66ef68f384',
            name: '101C',
            capacity: 50,
          },
        ],
      },
    ],
  },
];

/**
 * Example of the data returned from the /api/metadata endpoint, used for
 * populating certain fields throughout the app.
 */
export const metadata: MetadataResponse = {
  currentAcademicYear,
  areas,
  semesters,
  catalogPrefixes,
  campuses,
};
