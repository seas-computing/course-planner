/**
 * Converts the display name of an instructor to be in the
 * first-last name format (e.g. converts "Levine, Margo" to "Margo Levine").
 * Empty strings as inputs and one word strings as inputs themselves will be
 * returned as the output.
 */
export const instructorDisplayNameToFirstLast = (displayName: string):
string => displayName.split(/\s*,\s*/).reverse().join(' ');
export default instructorDisplayNameToFirstLast;
