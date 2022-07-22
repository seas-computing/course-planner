import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
  ChangeEvent,
} from 'react';
import {
  Button,
  Checkbox,
  LoadSpinner,
  POSITION,
  VARIANT,
  Dropdown,
} from 'mark-one';
import { MessageContext, MetadataContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseAPI } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { OFFERED, COURSE_TABLE_COLUMN, MANDATORY_COLUMNS } from 'common/constants';
import get from 'lodash.get';
import merge from 'lodash.merge';
import set from 'lodash.set';
import TERM, { TermKey } from 'common/constants/term';
import { VerticalSpace } from 'client/components/layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faDownload } from '@fortawesome/free-solid-svg-icons';
import { MenuFlex } from 'client/components/general';
import { useGroupGuard } from 'client/hooks/useGroupGuard';
import CourseInstanceTable from './CourseInstanceTable';
import ViewModal from './ViewModal';
import { formatFacultyNotes, tableFields } from './tableFields';
import { listFilter } from '../Filter';
import { FilterState } from './filters.d';
import MeetingModal from './MeetingModal';
import InstructorModal from './InstructorModal';
import { filterCoursesByInstructors } from '../utils/filterByInstructorValues';
import OfferedModal from './OfferedModal';
import NotesModal from './NotesModal';
import ReportDownloadModal from './ReportDownloadModal';
import { useStoredState } from '../../../hooks/useStoredState';
import EnrollmentModal from './EnrollmentModal';
import { AcademicYearUtils } from '../utils/academicYearOptions';

/**
 * The initial, empty state for the filters
 */

const emptyFilters: FilterState = {
  area: 'All',
  catalogNumber: '',
  title: '',
  isSEAS: 'All',
  spring: {
    offered: 'All',
    instructors: '',
  },
  fall: {
    offered: 'All',
    instructors: '',
  },
};

/**
 * Default View
 *
 * This is the hard-coded default view that is shown when a user loads the page
 * if there is no view saved in session Storage.
 */
const defaultView = [
  ...MANDATORY_COLUMNS,
  COURSE_TABLE_COLUMN.MEETINGS,
  COURSE_TABLE_COLUMN.IS_SEAS,
  COURSE_TABLE_COLUMN.OFFERED,
  COURSE_TABLE_COLUMN.INSTRUCTORS,
  COURSE_TABLE_COLUMN.NOTES,
];

interface ModalData {
  course?: CourseInstanceResponseDTO;
  visible: boolean;
}

type CourseInstanceModalData = ModalData & {
  term?: TERM;
};

const enum KEY {
  VIEW_COLUMNS = 'course-page-view-columns',
  CUSTOMIZE_VIEW_BUTTON = 'customize-view-button',
  REPORT_DOWNLOAD_BUTTON = 'download-report-button',
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

  /**
   * Control whether the ViewModal is visible
   */
  const [
    viewModalVisible,
    setViewModalVisible,
  ] = useState(false);

  /**
   * Control the columns that should be shown in the table
   */
  const [
    currentViewColumns,
    setCurrentViewColumns,
  ] = useStoredState<COURSE_TABLE_COLUMN[]>(
    KEY.VIEW_COLUMNS,
    defaultView,
    'sessionStorage'
  );

  /**
   * Control whether the "Download Report" modal is visible
   */
  const [
    reportModalVisible,
    setReportModalVisible,
  ] = useState(false);

  /**
   * Keeps track of the information needed to display the enrollment modal for a
   * specific course and semester
   */
  const [
    enrollmentModalData,
    setEnrollmentModalData,
  ] = useState<CourseInstanceModalData>({
    term: null,
    course: null,
    visible: false,
  });

  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

  /**
   * Keeps track of the information needed to display the meeting modal for a
   * specific course and term
   */
  const [
    meetingModalData,
    setMeetingModalData,
  ] = useState<CourseInstanceModalData>({
    term: null,
    course: null,
    visible: false,
  });

  /**
   * Keeps track of the information related to the edit notes modal
   */
  const [
    notesModalData,
    setNotesModalData,
  ] = useState<ModalData>({
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
  ] = useState<CourseInstanceModalData>({
    term: null,
    course: null,
    visible: false,
  });

  /**
   * Keeps track of the information needed to display the offered modal for a
   * specific course and term
   */
  const [
    offeredModalData,
    setOfferedModalData,
  ] = useState<CourseInstanceModalData>({
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
  const refTable = useRef<Record<string, HTMLButtonElement>>({});

  /**
   * When passed as the forwardRef prop to a component, it will generate a ref
   * pointing to the underlying element and add it to our refTable, so that we
   * can later retrieve the ref and focus the appropriate element
   */
  const setButtonRef = useCallback(
    (nodeId: string) => (node: HTMLButtonElement): void => {
      if (nodeId && node) {
        refTable.current[nodeId] = node;
      }
    }, [refTable]
  );

  /**
   * The current value of each of the course instance table filters. These
   * filter values are only used to control what's shown in the actual filter
   * inputs
   */
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  /**
   * The current value of the filters used to update the course list.
   * Separating this from the regular filters above gives us more control over
   * when we update the filters and makes the debouncing logic cleaner
   */
  const [activeFilters, setActiveFilters] = useState<FilterState>(emptyFilters);

  /**
   * Controls whether the retired courses are shown in the Course Instance table.
   * By default, the "Show Retired Courses" checkbox is unchecked, meaning that
   * the retired courses are not shown unless the checkbox is checked.
   */
  const [showRetired, setShowRetired] = useState(false);

  /**
   * Handles keeping track of the group of filters as the user interacts with
   * the filter dropdowns
   */
  const genericFilterUpdate = useCallback((field: string, value: string) => {
    setFilters((currentFilters) => {
      // Make a copy of the existing filters
      const newFilters = merge({}, currentFilters);
      set(newFilters, field, value);
      return newFilters;
    });
  }, [setFilters]);

  /**
   * Open the ViewModal and save its unique id
   */
  const openViewModal = useCallback((): void => {
    setViewModalVisible(true);
    setModalButtonId(KEY.CUSTOMIZE_VIEW_BUTTON);
  }, [setViewModalVisible, setModalButtonId]);

  /**
   * Close the ViewModal and persist the list of columns both to our
   * sessionStorage and to our local state
   */
  const closeViewModal = useCallback((columns: COURSE_TABLE_COLUMN[]): void => {
    setViewModalVisible(false);
    setCurrentViewColumns(columns);
    setTimeout(() => {
      if (modalButtonId && modalButtonId in refTable.current) {
        refTable.current[modalButtonId].focus();
      }
    });
  }, [modalButtonId, setCurrentViewColumns]);

  /**
   * Handle opening the download modal
   */
  const openDownloadModal = useCallback(() => {
    setReportModalVisible(true);
    setModalButtonId(KEY.REPORT_DOWNLOAD_BUTTON);
  }, [setReportModalVisible, setModalButtonId]);

  /**
   * Handle closing the download modal
   */
  const closeDownloadModal = useCallback(() => {
    setReportModalVisible(false);
    setTimeout(() => {
      if (modalButtonId && modalButtonId in refTable.current) {
        refTable.current[modalButtonId].focus();
      }
    });
  }, [modalButtonId]);

  /**
   * Takes the requested course and term information to display the requested
   * meeting modal
   */
  const openMeetingModal = useCallback(
    (course: CourseInstanceResponseDTO, term: TERM) => {
      setMeetingModalData({ course, term, visible: true });
      setModalButtonId(`meetings-${term.toLowerCase()}-${course.id}`);
    }, [setMeetingModalData, setModalButtonId]
  );

  /**
   * Takes the specified course and displays a modal to edit course notes
   */
  const openNotesModal = useCallback(
    (course: CourseInstanceResponseDTO, buttonId: string) => {
      setNotesModalData({ course, visible: true });
      setModalButtonId(buttonId);
    },
    [setNotesModalData, setModalButtonId]
  );

  /**
   * Handles closing the notes modal and setting the focus back to the button
   * that opened the modal.
   */
  const closeNotesModal = useCallback(() => {
    setNotesModalData({ visible: false });
    setTimeout(() => {
      if (modalButtonId && modalButtonId in refTable.current) {
        refTable.current[modalButtonId].focus();
      }
    });
  }, [modalButtonId, setNotesModalData]);

  /**
   * Takes the specified course and displays a modal to edit course enrollment
   */
  const openEnrollmentModal = useCallback(
    (course: CourseInstanceResponseDTO, term: TERM) => {
      setEnrollmentModalData({
        course,
        visible: true,
        term,
      });
      setModalButtonId(`${course.id}-${term.toLowerCase()}-edit-enrollment-button`);
    },
    [setEnrollmentModalData, setModalButtonId]
  );

  /**
   * Handles closing the enrollment modal and setting the focus back to the button
   * that opened the modal.
  */
  const closeEnrollmentModal = useCallback(() => {
    setEnrollmentModalData({ visible: false });
    setTimeout(() => {
      if (modalButtonId && modalButtonId in refTable.current) {
        refTable.current[modalButtonId].focus();
      }
    });
  }, [modalButtonId, setEnrollmentModalData]);

  /**
   * Handles closing the meeting modal and setting the focus back to the button
   * that opened the modal.
   */
  const closeMeetingModal = useCallback(() => {
    setMeetingModalData({ visible: false });
    setTimeout(() => {
      if (modalButtonId && modalButtonId in refTable.current) {
        refTable.current[modalButtonId].focus();
      }
    });
  }, [modalButtonId]);

  /**
   * Takes the requested course and term information to display the requested
   * meeting modal
   */
  const openInstructorModal = useCallback((
    course: CourseInstanceResponseDTO,
    term: TERM
  ) => {
    setInstructorModalData({ course, term, visible: true });
    setModalButtonId(`instructors-${term.toLowerCase()}-${course.id}`);
  }, [setInstructorModalData, setModalButtonId]);

  const closeInstructorModal = useCallback(() => {
    setInstructorModalData({ visible: false });
    setTimeout(() => {
      if (modalButtonId && modalButtonId in refTable.current) {
        refTable.current[modalButtonId].focus();
      }
    });
  }, [modalButtonId]);

  /**
   * Takes the requested course and term information to display the requested
   * offered modal
   */
  const openOfferedModal = useCallback((
    course: CourseInstanceResponseDTO,
    term: TERM
  ) => {
    setOfferedModalData({ course, term, visible: true });
    setModalButtonId(`offered-${term.toLowerCase()}-${course.id}`);
  }, [setOfferedModalData, setModalButtonId]);

  const closeOfferedModal = useCallback(() => {
    setOfferedModalData({ visible: false });
    setTimeout(() => {
      if (modalButtonId && modalButtonId in refTable.current) {
        refTable.current[modalButtonId].focus();
      }
    });
  }, [modalButtonId]);

  /**
   * Applies our activeFilters against our currentCourses, memoizing the result
   */
  const filteredCourses = useMemo(() => {
    let courses = [...currentCourses];
    // Provides a list of the paths for the filters in the Course Instance table
    const dropdownFilterPaths = ['area', 'isSEAS', 'fall.offered', 'spring.offered'];
    dropdownFilterPaths.forEach((filterPath) => {
      const filterValue = get(activeFilters, filterPath) as string;
      if (filterValue !== 'All') {
        courses = listFilter(
          courses,
          { field: `${filterPath}`, value: filterValue, exact: true }
        );
      }
    });
    const textFilterPaths = ['catalogNumber', 'title', 'fall.instructors', 'spring.instructors'];
    textFilterPaths.forEach((filterPath) => {
      const filterValue = get(activeFilters, filterPath) as string;
      if (filterValue !== '') {
        if (filterPath === 'fall.instructors' || filterPath === 'spring.instructors') {
          courses = filterCoursesByInstructors(
            courses, filterValue, filterPath
          );
        } else {
          courses = listFilter(
            courses,
            { field: `${filterPath}`, value: filterValue, exact: false }
          );
        }
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
    return courses;
  }, [currentCourses, activeFilters, showRetired]);

  /**
   * Track the current timeout from our debouncing process, below
   */
  const filterTimeoutId = useRef(null);

  /**
   * Handle debouncing the shift from our "working" filters state to our
   * activeFilters state, which will cause the memoized filteredCourses value
   * above to recompute.
   */
  useEffect(() => {
    // Cancel upcoming timeout if this block is called again
    if (filterTimeoutId.current != null) {
      clearTimeout(filterTimeoutId.current);
    }
    filterTimeoutId.current = setTimeout(() => {
      // Prevent trying to clear an unrelated timeout ID
      filterTimeoutId.current = null;
      setActiveFilters({
        ...filters,
        spring: {
          ...filters.spring,
        },
        fall: {
          ...filters.fall,
        },
      });
    }, 100);
    return () => {
      clearTimeout(filterTimeoutId.current);
    };
  }, [filters]);

  /**
   * Grab the metadata necessary to display the current year's data
   */
  const { currentAcademicYear, semesters } = useContext(MetadataContext);

  /**
   * Compute the range of academic years that will be displayed in the dropdown
   * at the top of the page
   */
  const academicYearOptions = useMemo(
    () => AcademicYearUtils.getAcademicYearOptions(semesters),
    [semesters]
  );

  /**
   * Track the academic year for which data will be shown in the table
   */
  const [
    selectedAcademicYear,
    setSelectedAcademicYear,
  ] = useState(currentAcademicYear);

  /**
   * Set up the initial data displayed in the table, including the actual
   * course data and any custom columns saved in sessionStorage
   */
  useEffect((): void => {
    setFetching(true);
    CourseAPI.getCourseInstancesForYear(selectedAcademicYear)
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
  }, [
    selectedAcademicYear,
    dispatchMessage,
  ]);

  /**
  * Method for updating a course in the local client list of courses. Intended
  * to accept the results of an update returned from the server, without
  * needing a full refresh of the data.
  */
  const updateLocalCourse = useCallback((
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
  }, [currentCourses, dispatchMessage]);

  /**
   * Method for updating a fall and spring course instances in the local client
   * list of courses. Intended to accept the results of an update returned from
   * the server, without needing a full refresh of the data.
   */
  const updateOfferedLocalCourses = useCallback((
    course: CourseInstanceResponseDTO,
    originalOfferedValue: OFFERED,
    wasFallUpdated: boolean
  ): void => {
    const updatedCourses = [...currentCourses];
    const originalCourseIndex = updatedCourses.findIndex(({ id }) => (
      id === course.id));
    if (originalCourseIndex >= 0) {
      const updatedCourse: CourseInstanceResponseDTO = {
        ...course,
        spring: { ...course.spring },
        fall: { ...course.fall },
      };
      // If the fall instance was the one that was updated and the value of
      // offered was changed to OFFERED.RETIRED, update the local spring
      // offered value to OFFERED.RETIRED as well.
      if (wasFallUpdated
        && originalOfferedValue !== OFFERED.RETIRED
        && course.fall.offered === OFFERED.RETIRED) {
        updatedCourse.spring.offered = OFFERED.RETIRED;
      }
      // If the fall offered field was changed from OFFERED.RETIRED, make the
      // spring offered value blank. There is also a check to make sure that
      // the user did not save an originally retired course as OFFERED.RETIRED,
      // because we only want to update the spring course to OFFERED.BLANK
      // if we are updating from OFFERED.RETIRED to any other OFFERED value.
      if (wasFallUpdated
        && originalOfferedValue === OFFERED.RETIRED
        && course.fall.offered !== OFFERED.RETIRED) {
        updatedCourse.spring.offered = OFFERED.BLANK;
      }
      updatedCourses.splice(originalCourseIndex, 1, updatedCourse);
      setCourses(updatedCourses);
      dispatchMessage({
        message: new AppMessage('Course updated.', MESSAGE_TYPE.SUCCESS),
        type: MESSAGE_ACTION.PUSH,
      });
    }
  }, [currentCourses, dispatchMessage]);

  /**
   * Memoize the table data so that it does not need to render unnecessarily
   * while typing in the text filter fields of the Course Instance table.
   */
  const tableData = useMemo(() => (
    tableFields.filter(
      ({ viewColumn }): boolean => (
        currentViewColumns.includes(viewColumn)
      )
    )
  ), [currentViewColumns]);

  /**
  * Check the current user's permission level and only display the edit buttons
  * if they are an admin
  */
  const { isAdmin } = useGroupGuard();

  return (
    <div className="course-instance-table">
      <VerticalSpace>
        <MenuFlex>
          <Button
            variant={VARIANT.INFO}
            alt="Download a spreadsheet with course data"
            onClick={openDownloadModal}
            forwardRef={setButtonRef(KEY.REPORT_DOWNLOAD_BUTTON)}
          >
            <FontAwesomeIcon
              icon={faDownload}
            />
            {' '}
            Download Course Report
          </Button>
          <Button
            variant={VARIANT.INFO}
            forwardRef={setButtonRef(KEY.CUSTOMIZE_VIEW_BUTTON)}
            onClick={openViewModal}
          >
            <FontAwesomeIcon
              icon={faWrench}
            />
            {' '}
            Customize View
          </Button>
          <Dropdown
            id="academic-year-selector"
            name="academic-year-selector"
            label="Academic Year"
            isLabelVisible
            options={academicYearOptions}
            value={selectedAcademicYear.toString()}
            onChange={
              ({
                target: { value },
              }: ChangeEvent<HTMLSelectElement>) => {
                setSelectedAcademicYear(parseInt(value, 10));
              }
            }
          />
          <Checkbox
            id="showRetiredCheckbox"
            name="showRetiredCheckbox"
            label="Show Retired"
            checked={showRetired}
            onChange={() => setShowRetired(!showRetired)}
            labelPosition={POSITION.RIGHT}
            hideError
          />
        </MenuFlex>
      </VerticalSpace>
      {
        fetching
          ? <LoadSpinner>Fetching Course Data</LoadSpinner>
          : (
            <CourseInstanceTable
              academicYear={selectedAcademicYear}
              courseList={filteredCourses}
              genericFilterUpdate={genericFilterUpdate}
              tableData={tableData}
              filters={filters}
              openMeetingModal={openMeetingModal}
              openInstructorModal={openInstructorModal}
              openOfferedModal={openOfferedModal}
              openNotesModal={openNotesModal}
              openEnrollmentModal={openEnrollmentModal}
              setButtonRef={setButtonRef}
              isAdmin={isAdmin}
            />
          )
      }
      <MeetingModal
        isVisible={meetingModalData.visible}
        currentSemester={{
          term: meetingModalData.term,
          calendarYear: selectedAcademicYear.toString(),
        }}
        currentCourse={meetingModalData.visible
          ? meetingModalData.course
          : null}
        getNotes={() => (
          formatFacultyNotes(
            meetingModalData.term,
            meetingModalData.course
          )
        )}
        onClose={closeMeetingModal}
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
          closeMeetingModal();
        }}
      />
      <NotesModal
        course={notesModalData.course}
        isVisible={notesModalData.visible}
        onClose={closeNotesModal}
        onSave={(course) => {
          updateLocalCourse({
            ...course,
          }, 'Course notes saved.');
          closeNotesModal();
        }}
        isEditable={isAdmin}
      />
      <InstructorModal
        isVisible={instructorModalData.visible}
        currentSemester={{
          term: instructorModalData.term,
          calendarYear: selectedAcademicYear.toString(),
        }}
        currentCourse={instructorModalData.course}
        closeModal={closeInstructorModal}
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
          closeInstructorModal();
        }}
      />
      <OfferedModal
        isVisible={offeredModalData.visible}
        currentSemester={{
          term: offeredModalData.term,
          calendarYear: selectedAcademicYear.toString(),
        }}
        currentCourseInstance={offeredModalData.course}
        onClose={closeOfferedModal}
        onSave={(
          instanceUpdate,
          originalOfferedValue,
          wasFallUpdated
        ) => {
          const { course, term } = offeredModalData;
          const semKey = term.toLowerCase() as TermKey;
          updateOfferedLocalCourses({
            ...course,
            [semKey]: {
              ...course[semKey],
              ...instanceUpdate,
            },
          },
          originalOfferedValue,
          wasFallUpdated);
          closeOfferedModal();
        }}
      />
      <ReportDownloadModal
        isVisible={reportModalVisible}
        closeModal={closeDownloadModal}
      />
      <ViewModal
        isVisible={viewModalVisible}
        currentViewColumns={currentViewColumns}
        onClose={closeViewModal}
      />
      <EnrollmentModal
        isVisible={enrollmentModalData.visible}
        course={enrollmentModalData.course}
        currentSemester={{
          term: enrollmentModalData.term,
          calendarYear: selectedAcademicYear.toString(),
        }}
        onSave={(data) => {
          const semKey = enrollmentModalData.term.toLowerCase() as TermKey;
          const {
            [semKey]: instance,
          } = enrollmentModalData.course;
          updateLocalCourse({
            ...enrollmentModalData.course,
            [semKey]: {
              ...instance,
              ...data,
            },
          }, 'Enrollment data saved.');
          closeEnrollmentModal();
        }}
        onClose={closeEnrollmentModal}
      />
    </div>
  );
};

export default CoursesPage;
