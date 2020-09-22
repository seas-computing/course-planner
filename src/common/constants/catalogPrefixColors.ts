/**
 * Defines colors associated with the different academic catalog prefixs at SEAS. These
 * are based on the school's official color palette and should not be adjusted
 * capriciously.
 */

const CATALOGPREFIX_COLORS = {
  AC: '#da373e',
  AM: '#4eadab',
  AP: '#cedb51',
  BE: '#f0b643',
  CS: '#6797db',
  EPS: '#946EB7',
  ES: '#f9df57',
  ESE: '#75c3d5',
  SEMINAR: '#ec8f9c',
  GenEd: '#c0c0c0',
  FRSEMR: '#c0c0c0',
  General: '#95b5df',
};

/**
 * Helper function that safely returns the hex string for the color associated
 * with a given catalogprefix, or else returns '' if there is no color
 * for the given value.
 */
export const getCatPrefixColor = (catalogprefix: string): string => {
  if (catalogprefix in CATALOGPREFIX_COLORS) {
    return CATALOGPREFIX_COLORS[catalogprefix] as string;
  }
  return CATALOGPREFIX_COLORS.General;
};

export default CATALOGPREFIX_COLORS;
