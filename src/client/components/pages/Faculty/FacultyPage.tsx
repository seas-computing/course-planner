import React, {
  ReactElement,
  FunctionComponent,
  useState,
  useContext,
  useEffect,
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
   * Get faculty schedule data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    setFetching(true);
    FacultyAPI.getFacultySchedulesForYear(acadYear)
      .then((facultySchedules): void => {
        setFacultySchedules(facultySchedules[acadYear]);
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
          <FacultyScheduleTable
            academicYear={acadYear}
            facultySchedules={currentFacultySchedules}
          />
        )}
    </div>
  );
};

export default FacultySchedule;
