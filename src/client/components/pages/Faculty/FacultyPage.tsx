import React, {
  ReactElement,
  FunctionComponent,
  useState,
  useContext,
  useEffect,
} from 'react';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { MessageContext } from 'client/context';
import { getFacultySchedulesForYear } from 'client/api';
import {
  AppMessage,
  MESSAGE_TYPE,
  MESSAGE_ACTION,
} from 'client/classes';
import FacultyScheduleTable from './FacultyScheduleTable';

/**
 * This component represents the Faculty page, which will be rendered at
 * the route '/faculty-schedule'
 */
const FacultySchedule: FunctionComponent = function (): ReactElement {
  /**
   * Store the list of faculty schedules to be displayed
   */
  const [currentFacultySchedules, setFacultySchedules] = useState(
    [] as FacultyResponseDTO[]
  );

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

  // TODO: Get the actual current academic year instead of hard coding
  const acadYear = 2020;

  /**
   * Get faculty schedule data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    setFetching(true);
    getFacultySchedulesForYear(acadYear)
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
  }, []);

  return (
    <div className="faculty-schedule-table">
      {fetching
        ? <p>Fetching data...</p>
        : (
          <FacultyScheduleTable
            academicYear={acadYear}
            facultySchedules={currentFacultySchedules}
          />
        )}
    </div>
  );
};

export default FacultySchedule;
