import { TERM } from 'common/constants';
import { DropdownOptionProps, DropdownProps } from 'mark-one';

/**
 * Compute the range of academic years that will be displayed in the dropdown
 * at the top of the page
 */
const getAcademicYearOptions = (semesters: string[]):
DropdownOptionProps[] => semesters
  .reduce<DropdownProps['options']>(
  (years, semester) => {
    if (semester.startsWith(TERM.SPRING)) {
      const academicYear = parseInt(
        semester.replace(/\D/g, ''),
        10
      );
      return years.concat([{
        label: `Fall ${academicYear - 1} - Spring ${academicYear}`,
        value: academicYear.toString(),
      }]);
    }
    return years;
  }, []
);

export const AcademicYearUtils = {
  getAcademicYearOptions,
};
