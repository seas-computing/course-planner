import get from 'lodash/get';

const listFilter = <T, > (
  list: T[],
  filter: { field: string, value: string, exact: boolean}
): T[] => {
  if (!filter) {
    return list;
  }
  if (!list || Object.keys(list).length === 0) {
    return list;
  }
  const filteredList = list.filter((item) => {
    return filter.exact
      ? get(item, filter.field) === filter.value
      : get(item, filter.field).includes(filter.value);
  });
  return filteredList;
};

export default listFilter;
