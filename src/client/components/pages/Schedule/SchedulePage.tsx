import React, {
  FunctionComponent, useState, useEffect, useContext,
} from 'react';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { getCourseScheduleForSemester } from 'client/api/courses';
import { TERM } from 'common/constants';
import { LoadSpinner } from 'mark-one';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MessageContext } from 'client/context';
import ScheduleView from './ScheduleView';

/**
 * Parameters for how the schedule view should be displayed. Currently using
 * static valuses.
 *
 * TODO: Consider deriving start and end times from schedule data
 * TODO: Move the calendarYear and term to dropdown in the UI
 * TODO: The days array could also be user controllable, for instance if we
 * wanted to provide a day-by-day view of the schedule or paginate it for
 * mobile view
 */

const FIRST_HOUR = 8;
const LAST_HOUR = 20;
const calendarYear = 2019;
const term = TERM.FALL;
const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

/**
 * This is the top-level page component for the Schedule. It's responsible for
 * fetching the data from the API, and for managing the state of any user-
 * selectable filters.
 */

const SchedulePage: FunctionComponent = () => {
  /**
  * Maintain the complete schedule data from the API in state
  */
  const [schedule, setSchedule] = useState<ScheduleViewResponseDTO[]>([]);

  /**
 * The function for displaying messages in the user interface
 */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Fetch the schedule data from the server, store it in state to pass into
   * the ScheduleView
   */
  useEffect(():void => {
    getCourseScheduleForSemester(calendarYear, term)
      .then((data):void => {
        setSchedule(data);
      })
      .catch(():void => {
        dispatchMessage({
          message: new AppMessage(
            'Unable to get schedule data from server. If the problem persists, contact SEAS Computing',
            MESSAGE_TYPE.ERROR
          ),
          type: MESSAGE_ACTION.PUSH,
        });
      });
  }, [setSchedule, dispatchMessage]);

  return (
    schedule.length > 0
      ? (
        <ScheduleView
          schedule={schedule}
          firstHour={FIRST_HOUR}
          lastHour={LAST_HOUR}
          days={days}
        />
      )
      : (
        <LoadSpinner>
          Fetching Course Schedule
        </LoadSpinner>
      )
  );
};

export default SchedulePage;
