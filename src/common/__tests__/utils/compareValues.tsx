/**
 * A generic comparison helper function that can be used to sort values
 */
export const compareValues = <T, >(a: T, b: T): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
