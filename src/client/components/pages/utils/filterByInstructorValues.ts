import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { InstructorResponseDTO } from 'common/dto/courses/InstructorResponse.dto';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import get from 'lodash.get';

/**
 * Filters the array of multi-year plans by the faculty display name
 */
export const filterPlansByInstructors = (
  multiYearPlans: MultiYearPlanResponseDTO[],
  instructorValues: Record<number, string>
): MultiYearPlanResponseDTO[] => {
  // Make a mutable ref to multiYearPlans to avoid parameter reassignment
  let plans = multiYearPlans;
  Object.entries(instructorValues)
  // Skip falsy values or else we will filter out all rows with a blank instructor
  // because of the .some() call, which returns false for an empty array.
    .filter(([, value]) => !!value)
    .forEach(([index, instructorFilter]) => {
      const instructorFilterLower = instructorFilter.toLowerCase();
      // Converting index to a number to appease compiler, which thinks index
      // is a string, but we know that index will be a number.
      const indexNum = parseInt(index, 10);
      // Filter by the instructors
      plans = plans
        .filter((plan) => plan.semesters[indexNum]
        && plan.semesters[indexNum]
          .instance.faculty.some((instructor) => instructor.displayName
            .toLowerCase()
            .includes(instructorFilterLower)));
    });
  return plans;
};

/**
 * Filters the courses based on the instructor list using the filter value
 * provided. The listFilter function cannot be used for this case, because
 * the value of instructors is an array objects as opposed to a string.
 */
export const filterCoursesByInstructors = (
  courses: CourseInstanceResponseDTO[],
  filterValue: string,
  filterPath: string
): CourseInstanceResponseDTO[] => {
  const filterValueLower = filterValue.toLowerCase();
  const filteredList = courses.filter((course) => {
    const instructors = get(course, filterPath, []) as
          InstructorResponseDTO[];
    return instructors.some((instructor) => instructor.displayName
      .toLowerCase().indexOf(filterValueLower) !== -1);
  });
  return filteredList;
};
