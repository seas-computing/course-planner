import { strictEqual } from 'assert';
import { FacultyCourse } from 'common/dto/faculty/FacultyResponse.dto';
import { appliedMathFacultyScheduleResponse, computerScienceFacultyScheduleResponse } from 'common/__tests__/data/faculty';
import { deduplicateCourses } from '../deduplicateCourses';

describe('deduplicateCourses helper function', function () {
  const updatedCSResponse = computerScienceFacultyScheduleResponse;
  // Edit one test faculty course array such that the sameAs is the value of
  // another test faculty course.
  updatedCSResponse.fall.courses[0].sameAs = appliedMathFacultyScheduleResponse
    .fall.courses[0].catalogNumber;
  // Merge the two arrays into one array of faculty courses
  const testCourses: FacultyCourse[] = appliedMathFacultyScheduleResponse
    .fall.courses.concat(
      updatedCSResponse.fall.courses
    );
  it('returns an array of unique courses', function () {
    const result = deduplicateCourses(testCourses);
    const resultSet = [...new Set(result)];
    strictEqual(result.length, resultSet.length);
  });
});
