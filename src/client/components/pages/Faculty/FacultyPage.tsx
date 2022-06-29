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
} from 'react';
import { VerticalSpace } from 'client/components/layout';
import { MenuFlexReverse } from 'client/components/general';
import { LoadSpinner, Checkbox, POSITION } from 'mark-one';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { MessageContext } from 'client/context';
import { FacultyAPI } from 'client/api';
import {
  AppMessage,
  MESSAGE_TYPE,
  MESSAGE_ACTION,
} from 'client/classes';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
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

  // TODO: Get the actual current academic year in future ticket instead of hard coding
  const acadYear = 2021;

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
    FacultyAPI.getFacultySchedulesForYear(acadYear)
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
  }, [dispatchMessage, isStaleData, isInitialized, closeAbsenceModal]);

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
              <MenuFlexReverse>
                <Checkbox
                  id="showRetiredFaculty"
                  name="showRetiredFaculty"
                  label="Show Retired"
                  checked={showRetired}
                  onChange={() => setShowRetired(!showRetired)}
                  labelPosition={POSITION.RIGHT}
                  hideError
                />
              </MenuFlexReverse>
            </VerticalSpace>
            <FacultyScheduleTable
              academicYear={acadYear}
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
