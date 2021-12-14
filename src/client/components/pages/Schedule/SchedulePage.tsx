import React, {
  FunctionComponent, useState, useEffect, useContext,
} from 'react';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { getCourseScheduleForSemester } from 'client/api/courses';
import { TERM } from 'common/constants';
import { LoadSpinner } from 'mark-one';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MessageContext, MetadataContext } from 'client/context';
import ScheduleView from './ScheduleView';

/**
 * Parameters for how the schedule view should be displayed. Currently using
 * static values.
 *
 * TODO: Consider deriving start and end times from schedule data
 * TODO: Move the calendarYear and term to dropdown in the UI
 */

const FIRST_HOUR = 8;
const LAST_HOUR = 20;

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
   * Provides the current Academic Year from the server
   * Later, we may add the current Term to metadata
   */
  const { currentAcademicYear } = useContext(MetadataContext);

  /**
   * Whether an API request is in progress
   */
  const [isFetching, setFetching] = useState<boolean>(false);

  /**
   * Fetch the schedule data from the server, store it in state to pass into
   * the ScheduleView
   */
  useEffect(():void => {
    setFetching(true);
    let currentCalendarYear = currentAcademicYear;
    const today = new Date();
    let currentTerm = TERM.SPRING;
    // Check if current month is later than or equal to July
    if (today.getMonth() >= 6) {
      currentTerm = TERM.FALL;
      currentCalendarYear -= 1;
    }

    getCourseScheduleForSemester(currentCalendarYear, currentTerm)
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
      }).finally(() => {
        setFetching(false);
      });
  }, [setSchedule, dispatchMessage, setFetching, currentAcademicYear]);

  if (isFetching) {
    return (
      <LoadSpinner>
        Fetching Course Schedule
      </LoadSpinner>
    );
  }
  if (schedule.length > 0) {
    return (
      <ScheduleView
        schedule={schedule}
        firstHour={FIRST_HOUR}
        lastHour={LAST_HOUR}
      />
    );
  }
  return null;
};

export default SchedulePage;
