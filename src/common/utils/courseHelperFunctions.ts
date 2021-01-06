/**
 * A helper function that parses a "catalog number" string to determine the
 * course prefix and number
 */
export const parseCatalogNumberForPrefixNumber = (catalogNumber: string):
{ prefix: string, number: string } => {
  const match = /^(\D+)?[\W]*(\d.*)?$/.exec(catalogNumber);
  return (
    {
      prefix: ((match && match[1]) || '').trim(),
      number: ((match && match[2]) || '').trim(),
    }
  );
};