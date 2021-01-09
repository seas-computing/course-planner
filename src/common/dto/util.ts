// A helper function that removes the whitespace from the beginning and end of
// a string. This will be used to sanitize text input submitted by the user.
export const trimIfString = (value: string): string => value?.trim();
