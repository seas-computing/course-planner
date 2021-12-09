import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
} from 'react';
import {
  Button,
  LoadSpinner,
  VARIANT,
} from 'mark-one';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseAPI } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { OFFERED, COURSE_TABLE_COLUMN, MANDATORY_COLUMNS } from 'common/constants';
import { ViewResponse } from 'common/dto/view/ViewResponse.dto';
import { VerticalSpace } from 'client/components/layout';
import CourseInstanceTable from './CourseInstanceTable';
import { tableFields } from './tableFields';
import ViewModal from './ViewModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench } from '@fortawesome/free-solid-svg-icons';


/**
 * Default View
 *
 * This is the hard-coded default view that is showin in the dropdown when a
 * user loads the page. Other views can be created, modified and deleted - but
 * this default view can never be deleted or updated.
 */
const defaultView: ViewResponse = {
  id: 'default',
  name: 'Default',
  columns: [
    ...MANDATORY_COLUMNS,
    COURSE_TABLE_COLUMN.MEETINGS,
    COURSE_TABLE_COLUMN.IS_SEAS,
    COURSE_TABLE_COLUMN.OFFERED,
    COURSE_TABLE_COLUMN.INSTRUCTORS,
    COURSE_TABLE_COLUMN.NOTES,
  ],
};

/*
 * TODO
 * Until the functionality for setting "Show Retired Courses" is iomplemented
 * this will be hard-coded here
 */
const showRetired = false;

// TODO: Get the actual current academic year instead of hard coding
const acadYear = 2019;

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

  const [
    viewModalVisible,
    setViewModalVisible,
  ] = useState(false);

  const [
    currentViewColumns,
    setCurrentViewColumns,
  ] = useState([] as COURSE_TABLE_COLUMN[]);

  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

  useEffect((): void => {
    setFetching(true);
    CourseAPI.getCourseInstancesForYear(acadYear)
      .then((courses: CourseInstanceResponseDTO[]): void => {
        setCurrentViewColumns(defaultView.columns);
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
            <VerticalSpace>
              <ViewModal isVisible={viewModalVisible} />
              <Button
                variant={VARIANT.INFO}
                onClick={() => {
                  setViewModalVisible(true);
                }}
              >
                <FontAwesomeIcon
                  icon={faWrench}
                />
                {' '}
                Customize View
              </Button>
            </VerticalSpace>
            <CourseInstanceTable
              academicYear={acadYear}
              courseList={
                showRetired
                  ? currentCourses
                  : currentCourses.filter(
                    ({ spring, fall }): boolean => (
                      fall.offered !== OFFERED.RETIRED
                          && spring.offered !== OFFERED.RETIRED)
                  )
              }
              courseUpdateHandler={updateLocalCourse}
              tableData={tableFields.filter(
                ({ viewColumn }): boolean => (
                  currentViewColumns.includes(viewColumn)
                )
              )}
            />
          </>
        )}
    </div>
  );
};

export default CoursesPage;
