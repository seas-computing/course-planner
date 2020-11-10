import React, {
  ReactElement,
  FunctionComponent,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { LoadSpinner } from 'mark-one';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { MessageContext } from 'client/context';
import { FacultyAPI } from 'client/api';
import {
  AppMessage,
  MESSAGE_TYPE,
  MESSAGE_ACTION,
} from 'client/classes';
import { TERM } from 'common/constants';
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
  const [currentFaculty, setFaculty] = useState(null as FacultyResponseDTO);

  /**
   * The current academic term
   */
  const [currentTerm, setTerm] = useState(null as TERM);

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

  // TODO: Get the actual current academic year in future ticket instead of hard coding
  const acadYear = 2021;

  /**
   * Gets the faculty schedule information for the academic year
   */
  const loadSchedules = useCallback(async (): Promise<void> => {
    try {
      setFacultySchedules(await FacultyAPI
        .getFacultySchedulesForYear(acadYear));
    } catch (e) {
      dispatchMessage({
        message: new AppMessage(
          'Unable to get faculty schedule data from server. If the problem persists, contact SEAS Computing',
          MESSAGE_TYPE.ERROR
        ),
        type: MESSAGE_ACTION.PUSH,
      });
    }
  }, [dispatchMessage, acadYear]);

  /**
   * Computes the id of the button for the absence being edited
   */
  const computeEditAbsenceButtonId = (faculty: FacultyResponseDTO, term: TERM):
  string => `editAbsence${faculty.id}${term}`;

  /**
   * Get faculty schedule data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    setFetching(true);
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
      });
  }, [dispatchMessage]);

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
            <FacultyScheduleTable
              academicYear={acadYear}
              facultySchedules={currentFacultySchedules}
              onEdit={(faculty, term, absence) => {
                setAbsenceModalVisible(true);
                setFaculty(faculty);
                setTerm(term);
                setAbsence(absence);
              }}
            />
            {(currentFaculty && currentAbsence)
              ? (
                <FacultyAbsenceModal
                  isVisible={absenceModalVisible}
                  currentFaculty={currentFaculty}
                  currentAbsence={currentAbsence}
                  onClose={(): void => {
                    setAbsenceModalVisible(false);
                    const buttonId = computeEditAbsenceButtonId(
                      currentFaculty,
                      currentTerm
                    );
                    const button = document.getElementById(buttonId);
                    // this will run after the data is loaded, so no delay is necessary
                    window.setTimeout((): void => {
                      button.focus();
                    }, 0);
                  }}
                  onSuccess={async (): Promise<void> => {
                    // wait for the table to load before allowing the dialog to close
                    await loadSchedules();
                  }}
                />
              )
              : null}
          </>
        )}
    </div>
  );
};

export default FacultySchedule;
