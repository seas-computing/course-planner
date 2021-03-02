import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
  Ref,
  useRef,
  useCallback,
} from 'react';
import { LoadSpinner } from 'mark-one';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseAPI } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { OFFERED, COURSE_TABLE_COLUMN } from 'common/constants';
import CourseInstanceTable from './CourseInstanceTable';
import { tableFields } from './tableFields';
import { CoursesPageContext, CoursesPageCourseInstance } from '../../../context/CoursesPageContext';
import MeetingModal from './MeetingModal';

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

  /**
   * Keeps track of whether a meeting modal is open.
   * By default, the modal is not visible.
   */
  const [
    meetingModalVisible,
    setMeetingModalVisible,
  ] = useState(false);

  /**
   * Keeps track of the current course instance to be used in the Courses Page
   * for display and updating purposes
   */
  const [
    currentCourseInstance,
    setCurrentCourseInstance,
  ] = useState(null as CoursesPageCourseInstance);

  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

  /**
   * The current ref of the edit meeting button
   */
  const meetingEditButtonRef: Ref<HTMLButtonElement> = useRef(null);

  /**
   * Set the ref focus for the edit meeting button
   */
  const setEditButtonFocus = (): void => {
    setTimeout((): void => meetingEditButtonRef.current.focus());
  };

  /**
   * Sets the course information when the edit meeting button is clicked and
   * opens the meeting modal, setting the focus to the modal header
   */
  const onMeetingEdit = (
    courseInstance: CoursesPageCourseInstance
  ): void => {
    setCurrentCourseInstance(courseInstance);
    setMeetingModalVisible(true);
  };

  /**
   * Closes the modal and sets the focus back to the edit button that opened
   * the modal
   */
  const closeMeetingModal = useCallback((): void => {
    setMeetingModalVisible(false);
    setEditButtonFocus();
  }, []);

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
            <CoursesPageContext.Provider
              value={{
                onMeetingEdit,
                meetingEditButtonRef,
                currentCourseInstance,
              }}
            >
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
                tableData={tableFields.filter(
                  ({ viewColumn }): boolean => (
                    currentView.includes(viewColumn)
                  )
                )}
              />
              {currentCourseInstance && meetingModalVisible
                ? (
                  <MeetingModal
                    isVisible={meetingModalVisible}
                    currentCourseInstance={currentCourseInstance}
                    onClose={closeMeetingModal}
                  />
                )
                : <></>}
            </CoursesPageContext.Provider>
          </>
        )}
    </div>
  );
};

export default CoursesPage;
