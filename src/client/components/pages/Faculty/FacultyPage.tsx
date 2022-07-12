import React, {
  ReactElement,
  FunctionComponent,
  useState,
  useContext,
  useEffect,
  Ref,
  useRef,
  useCallback,
  useMemo,
  ChangeEvent,
} from 'react';
import { VerticalSpace } from 'client/components/layout';
import { MenuFlex } from 'client/components/general';
import { LoadSpinner, Checkbox, POSITION } from 'mark-one';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { MessageContext, MetadataContext } from 'client/context';
import { FacultyAPI } from 'client/api';
import {
  AppMessage,
  MESSAGE_TYPE,
  MESSAGE_ACTION,
} from 'client/classes';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
import Dropdown, { DropdownProps } from 'mark-one/lib/Forms/Dropdown';
import { TERM } from 'common/constants';
import FacultyAbsenceModal from './FacultyAbsenceModal';
import FacultyScheduleTable from './FacultyScheduleTable';

/**
 * This component represents the Faculty page, which will be rendered at
 * the route '/faculty-schedule'
 */
const FacultySchedule: FunctionComponent = (): ReactElement => {
  /**
   * Store the list of faculty schedules to be displayed
   */
  const [currentFacultySchedules, setFacultySchedules] = useState(
    [] as FacultyResponseDTO[]
  );

  /**
   * The currently selected faculty
   */
  const [currentFaculty, setFaculty] = useState<FacultyResponseDTO>(null);

  /**
   * The currently selected absence
   */
  const [currentAbsence, setAbsence] = useState(null as AbsenceResponseDTO);

  /**
   * Keeps track of whether the absence modal is currently visible.
   * By default, the modal is not visible.
   */
  const [absenceModalVisible, setAbsenceModalVisible] = useState(false);

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Indicates whether the faculty data is in the process of being fetched
   */
  const [fetching, setFetching] = useState(false);

  /**
   * Indicates whether the faculty schedule data is outdated as a result of
   * updating schedule data by the user
   */
  const [isStaleData, setIsStaleData] = useState(false);

  /**
   * Whether or not the component has been initialized with data from the server.
   */
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Controls whether the retired faculty are shown in the Faculty table.
   * By default, the "Show Retired Faculty" checkbox is unchecked, meaning that
   * the retired courses are not shown unless the checkbox is checked.
   */
  const [showRetired, setShowRetired] = useState(false);

  /**
   * Grab the metadata necessary to display the current year's data
   */
  const { currentAcademicYear, semesters } = useContext(MetadataContext);

  /**
   * Compute the range of academic years that will be displayed in the dropdown
   * at the top of the page
   */
  const academicYearOptions = useMemo(
    () => semesters.reduce<DropdownProps['options']>(
      (years, semester) => {
        if (semester.startsWith(TERM.SPRING)) {
          const academicYear = parseInt(
            semester.replace(/\D/g, ''),
            10
          );
          return years.concat([{
            label: `Fall ${academicYear - 1} - Spring ${academicYear}`,
            value: academicYear.toString(),
          }]);
        }
        return years;
      }, []
    ), [semesters]
  );

  /**
   * Track the academic year for which data will be shown in the table
   */
  const [
    selectedAcademicYear,
    setSelectedAcademicYear,
  ] = useState(currentAcademicYear);

  /**
   * The current value of the edit fall absence button
   */
  const editButtonRef: Ref<HTMLButtonElement> = useRef(null);

  /**
   * Set the ref focus for the edit button
   */
  const setEditButtonFocus = (): void => {
    setTimeout((): void => {
      if (editButtonRef.current) {
        editButtonRef.current.focus();
      }
    });
  };

  const closeAbsenceModal = useCallback((): void => {
    setAbsenceModalVisible(false);
    setEditButtonFocus();
  }, []);

  /**
   * Get faculty schedule data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    // If we have initialized and are not stale, do nothing
    // This is required to prevent an infinite loop based on the changing
    // object value of currentFacultySchedules.
    if (isInitialized && !isStaleData) {
      return;
    }
    // Only set the fetching the first time to avoid replacing elements
    // after fetching, which causes button refocusing to fail.
    if (!isInitialized) {
      setFetching(true);
    }
    FacultyAPI.getFacultySchedulesForYear(selectedAcademicYear)
      .then((facultySchedules): void => {
        setFacultySchedules(facultySchedules);
      })
      .catch((err: Error): void => {
        dispatchMessage({
          message: new AppMessage(err.message, MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
      })
      .finally((): void => {
        setFetching(false);
        setIsStaleData(false);
        setIsInitialized(true);
        closeAbsenceModal();
      });
  }, [
    dispatchMessage,
    isStaleData,
    isInitialized,
    closeAbsenceModal,
    selectedAcademicYear,
  ]);

  /**
   * Filter/unfilter  faculty based on the showRetired checkbox, memoizing the result
   */
  const filteredFaculty = useMemo(() => {
    let faculty = [...currentFacultySchedules];
    if (!showRetired) {
      faculty = faculty.filter(
        ({ spring, fall }): boolean => (
          fall.absence.type === 'PRESENT'
          || spring.absence.type === 'PRESENT')
      );
    }
    return faculty;
  }, [showRetired, currentFacultySchedules]);

  return (
    <div className="faculty-schedule-table">
      {fetching
        ? (
          <div>
            <LoadSpinner>Fetching Faculty Data</LoadSpinner>
          </div>
        )
        : (
          <>
            <VerticalSpace>
              <MenuFlex>
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
                      setIsStaleData(true);
                      setSelectedAcademicYear(parseInt(value, 10));
                    }
                  }
                />
                <Checkbox
                  id="showRetiredFaculty"
                  name="showRetiredFaculty"
                  label='Show "No Longer Active" Faculty'
                  checked={showRetired}
                  onChange={
                    () => setShowRetired((prevShowRetired) => !prevShowRetired)
                  }
                  labelPosition={POSITION.RIGHT}
                  hideError
                />
              </MenuFlex>
            </VerticalSpace>
            <FacultyScheduleTable
              academicYear={selectedAcademicYear}
              facultySchedules={filteredFaculty}
              onEdit={(faculty, absence) => {
                setAbsenceModalVisible(true);
                setFaculty(faculty);
                setAbsence(absence);
              }}
              editButtonRef={editButtonRef}
            />
            {(currentFaculty && currentAbsence)
              ? (
                <FacultyAbsenceModal
                  isVisible={absenceModalVisible}
                  currentFaculty={currentFaculty}
                  currentAbsence={currentAbsence}
                  onSuccess={(): void => {
                    setIsStaleData(true);
                  }}
                  onCancel={closeAbsenceModal}
                />
              )
              : null}
          </>
        )}
    </div>
  );
};

export default FacultySchedule;
