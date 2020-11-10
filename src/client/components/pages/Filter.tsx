import get from 'lodash/get';
/*
* Filter a list of items bases on some filter criteria.
*/
const listFilter = <T, > (
  list: T[],
  filter: { field: string, value: string, exact: boolean | true}
): T[] => {
  /*
  * if filter field or value is empty return the same list.
  */
  if (!filter.field || !filter.value) {
    return list;
  }
  /*
  * if list is empty return the same list.
  */
  if (!list || Object.keys(list).length === 0) {
    return list;
  }
  /*
  * if filter field is not in the list item return an empty list,
  * otherwise filter the list based on the filter field and value.
  */
  try {
    const filteredList = list.filter((item) => (
      filter.exact
        ? (get(item, filter.field) as string) === filter.value
        : (get(item, filter.field) as string).includes(filter.value)
    ));
    return filteredList;
  } catch (error) {
    return [];
  }
};

export default listFilter;
