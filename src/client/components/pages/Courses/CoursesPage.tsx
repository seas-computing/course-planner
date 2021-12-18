import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
  Ref,
  useRef,
} from 'react';
import {
  LoadSpinner,
} from 'mark-one';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseAPI } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { OFFERED, COURSE_TABLE_COLUMN } from 'common/constants';
import get from 'lodash.get';
import merge from 'lodash.merge';
import set from 'lodash.set';
import TERM, { TermKey } from 'common/constants/term';
import CourseInstanceTable from './CourseInstanceTable';
import { formatFacultyNotes, tableFields } from './tableFields';
import { listFilter } from '../Filter';
import { FilterState } from './filters.d';
import MeetingModal from './MeetingModal';
import InstructorModal from './InstructorModal';

/*
 * TODO
 * Until the functionality for defining a retrieving custom view is implemented
 * we can just hard code/comment the columns to display
 */
const currentView = [
  COURSE_TABLE_COLUMN.AREA,
  COURSE_TABLE_COLUMN.CATALOG_NUMBER,
  COURSE_TABLE_COLUMN.TITLE,
  COURSE_TABLE_COLUMN.SAME_AS,
  COURSE_TABLE_COLUMN.IS_SEAS,
  // COURSE_TABLE_COLUMN.IS_UNDERGRADUATE,
  COURSE_TABLE_COLUMN.OFFERED,
  COURSE_TABLE_COLUMN.INSTRUCTORS,
  COURSE_TABLE_COLUMN.MEETINGS,
  // COURSE_TABLE_COLUMN.ENROLLMENT,
  COURSE_TABLE_COLUMN.NOTES,
  COURSE_TABLE_COLUMN.DETAILS,
];

/*
 * TODO
 * Until the functionality for setting "Show Retired Courses" is implemented
 * this will be hard-coded here
 */
const showRetired = false;

// TODO: Get the actual current academic year instead of hard coding
const acadYear = 2019;

interface ModalData {
  term?: TERM;
  course?: CourseInstanceResponseDTO;
  visible: boolean;
}

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

  /**
   * Keeps track of the list of courses to be displayed as users interact with
   * the table filters
   */
  const [
    filteredCourses,
    setFilteredCourses,
  ] = useState<CourseInstanceResponseDTO[]>([]);

  const [fetching, setFetching] = useState(false);

  /**
   * The current value of each of the course instance table filters
   */
  const [filters, setFilters] = useState<FilterState>({
    area: 'All',
    isSEAS: 'All',
    spring: {
      offered: 'All',
    },
    fall: {
      offered: 'All',
    },
  });

  /**
   * Handles keeping track of the group of filters as the user interacts with
   * the filter dropdowns
   */
  const genericFilterUpdate = (field: string, value: string) => {
    setFilters((currentFilters) => {
      // Make a copy of the existing filters
      const newFilters = merge({}, currentFilters);
      set(newFilters, field, value);
      return newFilters;
    });
  };

    // Provides a list of the paths for the filters in the Course Instance table
    const filterPaths = ['area', 'isSEAS', 'fall.offered', 'spring.offered'];
    filterPaths.forEach((filterPath) => {
      const filterValue = get(filters, filterPath) as string;
      if (filterValue !== 'All') {
        courses = listFilter(
          courses,
          { field: `${filterPath}`, value: filterValue, exact: true }
        );
      }
    });
    // Hides the retired courses
    if (!showRetired) {
      courses = courses.filter(
        ({ spring, fall }): boolean => (
          fall.offered !== OFFERED.RETIRED
              && spring.offered !== OFFERED.RETIRED)
      );
    }
    setFilteredCourses(courses);
  }, [filters, currentCourses, setFilteredCourses]);

  useEffect((): void => {
    setFetching(true);
    CourseAPI.getCourseInstancesForYear(acadYear)
      .then((courses: CourseInstanceResponseDTO[]): void => {
        setCourses(courses);
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
  }, [dispatchMessage]);

  /**
  * Method for updating a course in the local client list of courses. Intended
  * to accept the results of an update returned from the server, without
  * needing a full refresh of the data.
  */
  const updateLocalCourse = (
    course: CourseInstanceResponseDTO,
    message?: string
  ): void => {
    const updatedCourses = [...currentCourses];
    const originalCourseIndex = updatedCourses.findIndex(({ id }) => (
      id === course.id));
    if (originalCourseIndex >= 0) {
      updatedCourses.splice(originalCourseIndex, 1, course);
      setCourses(updatedCourses);
      dispatchMessage({
        message: new AppMessage(['Course updated.', message].join(' '), MESSAGE_TYPE.SUCCESS),
        type: MESSAGE_ACTION.PUSH,
      });
    }
  };

  const tableData = tableFields.filter(
    ({ viewColumn }): boolean => (
      currentView.includes(viewColumn)
    )
  );

  return (
    <div className="course-instance-table">
      {fetching
        ? (
          <div>
            <LoadSpinner>Fetching Course Data</LoadSpinner>
          </div>
        )
        : (
          <>
            <CourseInstanceTable
              academicYear={acadYear}
              courseList={filteredCourses}
              genericFilterUpdate={genericFilterUpdate}
              tableData={tableData}
              filters={filters}
              openMeetingModal={openMeetingModal}
              openInstructorModal={openInstructorModal}
              buttonRef={buttonRef}
            />
        )}
    </div>
  );
};

export default CoursesPage;
