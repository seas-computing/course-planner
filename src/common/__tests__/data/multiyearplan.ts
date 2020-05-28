import { TERM } from 'common/constants';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';

/**
 * An example [[MultiYearPlanResponseDTO]] response representing ac207
 */

export const ac207MultiYearPlanResponse: MultiYearPlanResponseDTO = {
  id: '95dfde1c-0844-466d-bb6e-8057f0371f8f',
  area: 'ACS',
  catalogNumber: 'AC 207*',
  title: 'Computational Foundations of Data Science',
  instances: [
    {
      id: 'b93cd5cd-fafb-468f-99fb-bc5af686ed17',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      faculty: [],
    },
    {
      id: 'bf1dd0b9-00fd-4523-8ef2-187402f34daa',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      faculty: [],
    },
    {
      id: 'b343a8d6-f4b7-426b-a9db-bd7492f41a36',
      academicYear: '2023',
      calendarYear: '2022',
      term: TERM.FALL,
      faculty: [],
    },
    {
      id: '7da903e5-9072-4bd5-90aa-22804021223b',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      faculty: [],
    },
    {
      id: 'fd562e0e-2f96-45bd-b63d-cac0cf04bdd2',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      faculty: [],
    },
    {
      id: '35401c93-b8a2-4a3c-9778-1daa91f27af3',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      faculty: [],
    },
    {
      id: '84097ebc-59d2-4f71-b7df-150428421ae4',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      faculty: [],
    },
  ],
};

/**
 * An example [[MultiYearPlanResponseDTO]] response representing es285
 */

export const es285MultiYearPlanResponse: MultiYearPlanResponseDTO = {
  id: 'e05f3f9f-b9f0-402f-95fc-dbf54a1620cc',
  area: 'MSMBA',
  catalogNumber: 'ES 285',
  title: 'Integrated Design',
  instances: [
    {
      id: 'fea74811-de5f-430c-a7c0-9af17a7e7432',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      faculty: [
        {
          id: '02e0b08d-e130-4524-9df2-1c84ada3ca51',
          displayName: 'Altringer, Bethanne',
          instructorOrder: 0,
        },
        {
          id: 'd5fb01f7-5e6b-4831-b864-9b17fbe5c281',
          displayName: 'Gajos, Krzysztof',
          instructorOrder: 1,
        },
        {
          id: '221eca27-8458-41a6-a616-b9dc343f621b',
          displayName: 'MacCormack, Alan',
          instructorOrder: 2,
        },
      ],
    },
    {
      id: '344e31ce-f1d4-4585-8ff0-779e1d56794f',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      faculty: [],
    },
    {
      id: 'ec6e0bc2-be5a-44aa-a5d0-cff8eb5abcd2',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      faculty: [],
    },
    {
      id: '7077ef8d-ab8d-430f-9f73-529d6f2dfc44',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      faculty: [],
    },
    {
      id: '295fadf7-6c2a-4f59-98dd-ba6f7d2d208a',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      faculty: [],
    },
    {
      id: 'f6ffc522-a1e4-49e9-ba0f-5a62ac368fe8',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      faculty: [],
    },
    {
      id: '005fe6f4-6e7a-4414-81c5-2ab6a96df253',
      academicYear: '2023',
      calendarYear: '2022',
      term: TERM.FALL,
      faculty: [],
    },
  ],
};
