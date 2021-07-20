import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
} from 'react';
import { LoadSpinner } from 'mark-one';
import { MessageContext } from 'client/context';
import { NonClassMeetingApi, NonClassMeetingsApiResponse } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import NonClassMeetingsTable from './NonClassMeetingsTable';

// TODO: Get the actual current academic year instead of hard coding
const acadYear = 2022;

/**
 * Component representing the list of non-class meetings in a given Academic year
 */
const NonClassMeetingsPage: FunctionComponent = (): ReactElement => {
  /**
  * Store the list of non-class meetings to displayed
  */
  const [
    nonClassMeetings,
    setNonClassMeetings,
  ] = useState({ [acadYear]: [] } as NonClassMeetingsApiResponse);

  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

  useEffect((): void => {
    setFetching(true);
    NonClassMeetingApi.getNonClassMeetings(acadYear)
      .then((data: NonClassMeetingsApiResponse): void => {
        setNonClassMeetings(data);
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
    <div className="non-class-meeting-table">
      {fetching
        ? (
          <div>
            <LoadSpinner>Fetching Non-class Event Data</LoadSpinner>
          </div>
        )
        : (
          <>
            <NonClassMeetingsTable
              academicYear={acadYear}
              nonClassMeetingList={Object.values(nonClassMeetings)[0]}
            />
          </>
        )}
    </div>
  );
};

export default NonClassMeetingsPage;
