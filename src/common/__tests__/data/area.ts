import { Area } from 'server/area/area.entity';

/**
 * A collection of area data, as returned by the database query in
 * [[AreaService#find]]
 */
export const rawAreaList = [
  { name: 'ACS' },
  { name: 'AM' },
  { name: 'AP' },
  { name: 'BE' },
  { name: 'CS' },
  { name: 'EE' },
  { name: 'ESE' },
  { name: 'General' },
  { name: 'Mat & ME' },
  { name: 'MDE' },
  { name: 'MSMBA' },
  { name: 'SEM' },
];

/**
 * An example of an [[Area]] entity
 */
export const appliedMath = Object.assign(new Area(), {
  id: '4d4e622a-a843-43e1-8f53-c99532583178',
  name: 'AM',
} as Partial<Area>);
