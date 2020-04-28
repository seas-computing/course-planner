import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
} from 'react';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { getCourseInstancesForYear } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { OFFERED } from 'common/constants';
import CourseInstanceTable from './CourseInstanceTable';
import { tableFields } from './tableFields';
/**
 * TODO
 * Until the functionality for defining a retrieving custom view is implemented
 * we can just hard code/comment the columns to display
 */
const currentView = [
  'area',
  'catalogNumber',
  'title',
  'sameAs',
  'isSEAS',
  'isUndergraduate',
  'offered',
  'instructors',
  'times',
  'rooms',
  'enrollment',
  'notes',
];

/**
 * TODO
 * Until the functionality for setting "Show Retired Courses" is iomplemented
 * this will be hard-coded here
 */
const showRetired = false;


// TODO: Get the actual current academic year instead of hard coding
const acadYear = 2020;
/**
 * Component representing the list of CourseInstances in a given Academic year
 */
const CoursesPage: FunctionComponent = (): ReactElement => {
  /**
  * Store the list of courses/instances to displayed
  */
  const [
    currentCourses,
    setCourses,
  ] = useState([] as CourseInstanceResponseDTO[]);

  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

  useEffect((): void => {
    setFetching(true);
    getCourseInstancesForYear(acadYear)
      .then((courses: CourseInstanceResponseDTO[][]): void => {
        setCourses(courses[0]);
      })
      .catch((err: Error): void => {
        dispatchMessage({
          message: new AppMessage(err.message, MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
      })
      .finally((): void => {
        setFetching(false);
      });
  }, []);

  return (
    <div className="course-instance-table">
      {fetching
        ? <p>Fetching data...</p>
        : (
          <CourseInstanceTable
            academicYear={acadYear}
            courseList={
              showRetired
                ? currentCourses
                : currentCourses.filter(
                  ({ spring, fall }): boolean => (
                    fall.offered !== OFFERED.RETIRED
                    && spring.offered !== OFFERED.RETIRED)
                )}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                currentView.includes(viewColumn) || viewColumn === 'details'
              )
            )}
          />
        )

      }
    </div>
  );
};

export default CoursesPage;
