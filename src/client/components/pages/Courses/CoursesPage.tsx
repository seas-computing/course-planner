import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
  Ref,
  useRef,
  useMemo,
} from 'react';
import { Dropdown, LoadSpinner, POSITION } from 'mark-one';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseAPI } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { OFFERED, COURSE_TABLE_COLUMN } from 'common/constants';
import get from 'lodash.get';
import merge from 'lodash.merge';
import set from 'lodash.set';
import TERM, { TermKey } from 'common/constants/term';
import { ViewResponse } from 'common/dto/view/ViewResponse.dto';
import { VerticalSpace } from 'client/components/layout';
import CourseInstanceTable from './CourseInstanceTable';
import { formatFacultyNotes, tableFields } from './tableFields';
import { listFilter } from '../Filter';
import { FilterState } from './filters.d';
import MeetingModal from './MeetingModal';
import InstructorModal from './InstructorModal';

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

  const [
    currentViewId,
    setCurrentViewId,
  ] = useState(defaultView.id);

  const [
    views,
  ] = useState([
    defaultView,
  ]);

  const currentView = useMemo(
    () => views.find(({ id }) => id === currentViewId),
    [views, currentViewId]
  );

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
   * Keeps track of the information needed to display the meeting modal for a
   * specific course and term
   */
  const [
    meetingModalData,
    setMeetingModalData,
  ] = useState<ModalData>({
    term: null,
    course: null,
    visible: false,
  });

  /**
   * Keeps track of the information needed to display the instructor modal for a
   * specific course and term
   */
  const [
    instructorModalData,
    setInstructorModalData,
  ] = useState<ModalData>({
    term: null,
    course: null,
    visible: false,
  });

  /**
   * The id of the edit button that was clicked to open the modal is used to
   * determine whether the ref should be set to that button so that when the
   * modal closes, the focus is returned to the edit button of the corresponding
   * modal.
   */
  const [modalButtonId, setModalButtonId] = useState<string>('');

  /**
   * The current ref value of the focused button
   */
  const buttonRef: Ref<HTMLButtonElement> = useRef(null);

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

  /**
   * Takes the requested course and term information to display the requested
   * meeting modal
   */
  const openMeetingModal = (course: CourseInstanceResponseDTO, term: TERM) => {
    setMeetingModalData({ course, term, visible: true });
    setModalButtonId(`meetings-${course.id}-${term}`);
  };

  /**
   * Takes the requested course and term information to display the requested
   * meeting modal
   */
  const openInstructorModal = (
    course: CourseInstanceResponseDTO,
    term: TERM
  ) => {
    setInstructorModalData({ course, term, visible: true });
    setModalButtonId(`instructors-${course.id}-${term}`);
  };

  useEffect(() => {
    let courses = [...currentCourses];
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
              <Dropdown
                id="select-view-dropdown"
                name="select-view-dropdown"
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  setCurrentViewId(event.currentTarget.value);
                }}
                labelPosition={POSITION.LEFT}
                label="View"
                value={currentViewId}
                options={views.map((view) => ({
                  label: view.name,
                  value: view.id,
                }))}
              />
            </VerticalSpace>
            <CourseInstanceTable
              academicYear={acadYear}
              courseList={filteredCourses}
              genericFilterUpdate={genericFilterUpdate}
              tableData={tableFields.filter(
                ({ viewColumn }): boolean => (
                  currentView.columns.includes(viewColumn)
                )
              )}
              filters={filters}
              openMeetingModal={openMeetingModal}
              openInstructorModal={openInstructorModal}
              modalButtonId={modalButtonId}
              buttonRef={buttonRef}
            />
            {meetingModalData.visible
              ? (
                <MeetingModal
                  isVisible={meetingModalData.visible}
                  currentSemester={{
                    term: meetingModalData.term,
                    calendarYear: acadYear.toString(),
                  }}
                  currentCourse={meetingModalData.course}
                  notes={formatFacultyNotes(
                    meetingModalData.term,
                    meetingModalData.course
                  )}
                  onClose={() => {
                    setMeetingModalData({ visible: false });
                    setTimeout(() => { buttonRef.current?.focus(); });
                  }}
                  onSave={(newMeetingList, message?: string) => {
                    const { course, term } = meetingModalData;
                    const semKey = term.toLowerCase() as TermKey;
                    updateLocalCourse({
                      ...course,
                      [semKey]: {
                        ...course[semKey],
                        meetings: newMeetingList,
                      },
                    }, message);
                  }}
                />
              )
              : null}
            {instructorModalData.visible
              ? (
                <InstructorModal
                  isVisible={instructorModalData.visible}
                  currentSemester={{
                    term: instructorModalData.term,
                    calendarYear: acadYear.toString(),
                  }}
                  currentCourse={instructorModalData.course}
                  closeModal={() => {
                    setInstructorModalData({ visible: false });
                    setTimeout(() => { buttonRef.current?.focus(); });
                  }}
                  onSave={(newInstructorList, message?: string) => {
                    const { course, term } = instructorModalData;
                    const semKey = term.toLowerCase() as TermKey;
                    updateLocalCourse({
                      ...course,
                      [semKey]: {
                        ...course[semKey],
                        instructors: newInstructorList,
                      },
                    }, message);
                  }}
                />
              )
              : null}
          </>
        )}
    </div>
  );
};

export default CoursesPage;
