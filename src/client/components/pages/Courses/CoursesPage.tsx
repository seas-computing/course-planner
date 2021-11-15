import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { Dropdown, LoadSpinner, POSITION } from 'mark-one';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseAPI } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { OFFERED, COURSE_TABLE_COLUMN } from 'common/constants';
import { ViewResponse } from 'common/dto/view/ViewResponse.dto';
import CourseInstanceTable from './CourseInstanceTable';
import { tableFields } from './tableFields';

/**
 * These columns are ALWAYS shown regardless of user choice
 */
const mandatoryColumns = [
  COURSE_TABLE_COLUMN.AREA,
  COURSE_TABLE_COLUMN.CATALOG_NUMBER,
  COURSE_TABLE_COLUMN.DETAILS,
];

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
    ...mandatoryColumns,
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
    currentViewId,
    setCurrentViewId,
  ] = useState(defaultView.id);

  const [
    views,
  ] = useState([
    defaultView,
  ] as ViewResponse[]);

  const currentView = useMemo(
    () => views.find(({ id }) => id === currentViewId),
    [views, currentViewId]
  );

  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

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
            <Dropdown
              id="select-view-dropdown"
              name="select-view-dropdown"
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setCurrentViewId(event.currentTarget.value);
              }}
              labelPosition={POSITION.LEFT}
              label="View"
              value={currentViewId}
              options={[
                ...views.map((view) => ({
                  label: view.name,
                  value: view.id,
                })),
              ]}
            />
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
                  currentView.columns.includes(viewColumn)
                )
              )}
            />
          </>
        )}
    </div>
  );
};

export default CoursesPage;
