import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';

/**
 * Filters the array of multi-year plans by the faculty display name
 */
export const filterByInstructorValues = (
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
        .filter((plan) => plan
          .semesters[indexNum]
          .instance.faculty.some((instructor) => instructor.displayName
            .toLowerCase()
            .includes(instructorFilterLower)));
    });
  return plans;
};

export default filterByInstructorValues;
