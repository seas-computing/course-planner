/**
 * Defines colors associated with the different academic areas at SEAS. These
 * are based on the school's official color palette and should not be adjusted
 * capriciously.
 */

const AREA_COLORS = {
  ACS: '#da373e',
  AM: '#4eadab',
  AP: '#cedb51',
  BE: '#f0b643',
  CS: '#6797db',
  EE: '#f9df57',
  ESE: '#75c3d5',
  General: '#95b5df',
  'Mat & ME': '#b18cbb',
  MDE: '#c0c0c0',
  MSMBA: '#946eb7',
  SEM: '#ec8f9c',
};

/**
 * Helper function that safely returns the hex string for the color associated
 * with a given area, or else returns '' if there is no color
 * for the given value.
 */
export const getAreaColor = (area: string): string => {
  if (area in AREA_COLORS) {
    return AREA_COLORS[area] as string;
  }
  return '';
};

export default AREA_COLORS;
