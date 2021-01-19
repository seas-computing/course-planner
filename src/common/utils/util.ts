/**
 * A helper function to convert a string from camel case to title case
 */
export const camelCaseToTitleCase = (original: string): string => {
  const sentenceCase = original.replace(/([a-z])([A-Z])/g, '$1 $2');
  return sentenceCase.charAt(0).toUpperCase() + sentenceCase.slice(1);
};
