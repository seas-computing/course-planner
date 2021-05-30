import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonLayout, ListLayout, TimePicker } from 'client/components/general';
import { VerticalSpace } from 'client/components/layout';
import DAY, { dayEnumToString, days } from 'common/constants/day';
import { meetingTimeSlots } from 'common/constants/timeslots';
import { CourseInstanceResponseMeeting } from 'common/dto/courses/CourseInstanceResponse';
import { MeetingRoomResponse } from 'common/dto/meeting/MeetingResponse.dto';
import { calculateStartEndTimes, convert12To24HourTime, convertTo12HourDisplayTime } from 'common/utils/timeHelperFunctions';
import {
  BorderlessButton,
  Button,
  Dropdown,
  TextInput,
  ValidationErrorMessage,
  VARIANT,
} from 'mark-one';
import React, { FunctionComponent, ReactElement, useState } from 'react';
import styled from 'styled-components';

/**
 * Contains the meeting day and time selectors so they can be displayed side by side
 */
const TimeSelector = styled.div`
  display: flex;
  flex-direction: row;
`;

interface MeetingTimesListProps {
  /**
   * The current existing meetings for this course instance
   */
  meetings: CourseInstanceResponseMeeting[];
}

/**
 * The meeting times section of the modal that allows users to edit meetings
 * for a particular course instance.
 */
export const MeetingTimesList
: FunctionComponent<MeetingTimesListProps> = function ({
  meetings,
}): ReactElement {
  /**
   * Keeps track of the current meetings for this instance. This is updated as
   * users add and edit meetings in the modal.
   */
  const [
    currentMeetings,
    setCurrentMeetings,
  ] = useState(meetings);

  /**
   * The meeting within the list of meetings that is currently being edited
   */
  const [
    currentMeetingId,
    setCurrentMeetingId,
  ] = useState(null as string);

  /**
   * The selected day in the dropdown for the meeting currently being edited
   */
  const [
    currentDay,
    setCurrentDay,
  ] = useState(null as DAY);

  /**
   * The timeslot currently selected in the time picker dropdown
   */
  const [
    currentTimeslot,
    setCurrentTimeslot,
  ] = useState(null as string);

  /**
   * The start time value for the meeting currently being edited
   */
  const [
    currentStartTime,
    setCurrentStartTime,
  ] = useState(null as string);

  /**
   * The end time value for the meeting currently being edited
   */
  const [
    currentEndTime,
    setCurrentEndTime,
  ] = useState(null as string);

  /**
   * The room assigned to the meeting currently being edited
   */
  const [
    currentRoom,
    setCurrentRoom,
  ] = useState(null as MeetingRoomResponse);

  /**
   * The current value of the error message when creating or editing a meeting time
   */
  const [
    meetingTimeError,
    setMeetingTimeError,
  ] = useState('');

  return (
    <div className="meeting-times-section">
      <ul>
        {currentMeetings.map(
          (meeting) => (
            <ListLayout key={meeting.id}>
              <BorderlessButton
                id={`deleteButton${meeting.id}`}
                variant={VARIANT.DANGER}
                onClick={
                  (): void => {}
                }
              >
                <FontAwesomeIcon icon={faTrash} />
              </BorderlessButton>
              {
                meeting.id === currentMeetingId
                  ? (
                    <div>
                      <TimeSelector>
                        <Dropdown
                          id="meetingDay"
                          name="meetingDay"
                          label="Meeting Day"
                          options={days.map((day) => ({
                            value: day,
                            label: dayEnumToString(day),
                          }))}
                          value={currentDay}
                          onChange={(event
                          : React.ChangeEvent<HTMLSelectElement>): void => {
                            setCurrentDay(event.currentTarget.value as DAY);
                            setCurrentMeetings(currentMeetings.map(
                              (currentMeeting) => (
                                currentMeeting.id === currentMeetingId
                                  ? {
                                    ...currentMeeting,
                                    day: event.currentTarget.value as DAY,
                                  }
                                  : currentMeeting
                              )
                            ));
                          }}
                          hideError
                          isRequired
                          isLabelVisible={false}
                        />
                        <TimePicker
                          id="timeslots"
                          name="timeslots"
                          options={[{ value: '', label: '🕒' }]
                            .concat(meetingTimeSlots.map((slot) => ({
                              value: slot,
                              label: slot,
                            })))}
                          value={currentTimeslot}
                          onChange={(event
                          : React.ChangeEvent<HTMLSelectElement>)
                          : void => {
                            if (event.currentTarget.value !== '') {
                              const times = calculateStartEndTimes(
                                event.currentTarget.value
                              );
                              setCurrentStartTime(times.start);
                              setCurrentEndTime(times.end);
                            }
                          }}
                        />
                        <TextInput
                          id="meetingStartTime"
                          name="meetingStartTime"
                          label="Meeting Start Time"
                          type="time"
                          value={convert12To24HourTime(currentStartTime)}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>)
                          : void => {
                            setCurrentStartTime(event.currentTarget.value);
                            setCurrentMeetings(currentMeetings.map(
                              (currentMeeting) => (
                                currentMeeting.id === currentMeetingId
                                  ? {
                                    ...currentMeeting,
                                    startTime: event.currentTarget.value,
                                  }
                                  : currentMeeting
                              )
                            ));
                          }}
                          hideError
                          isRequired
                          isLabelVisible={false}
                        />
                        <TextInput
                          id="meetingEndTime"
                          name="meetingEndTime"
                          label="Meeting End Time"
                          type="time"
                          value={convert12To24HourTime(currentEndTime)}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>)
                          : void => {
                            setCurrentEndTime(event.currentTarget.value);
                            setCurrentMeetings(currentMeetings.map(
                              (currentMeeting) => (
                                currentMeeting.id === currentMeetingId
                                  ? {
                                    ...currentMeeting,
                                    endTime: event.currentTarget.value,
                                  }
                                  : currentMeeting
                              )
                            ));
                          }}
                          hideError
                          isRequired
                          isLabelVisible={false}
                        />
                        <ValidationErrorMessage
                          id="meetingTimeErrorMessage"
                        >
                          {meetingTimeError}
                        </ValidationErrorMessage>
                      </TimeSelector>
                      <div>
                        <span>
                          Room:
                          {` ${currentRoom.name}`}
                        </span>
                        <ButtonLayout>
                          <Button
                            id="closeButton"
                            onClick={
                              (): void => {}
                            }
                            variant={VARIANT.SECONDARY}
                          >
                            Close
                          </Button>
                          <Button
                            id="showRoomsButton"
                            onClick={
                              (): void => {}
                            }
                            variant={VARIANT.PRIMARY}
                          >
                            Show Rooms
                          </Button>
                        </ButtonLayout>
                      </div>
                    </div>
                  )
                  : (
                    <>
                      <span>{`${dayEnumToString(meeting.day)}, ${convertTo12HourDisplayTime(meeting.startTime)} to ${convertTo12HourDisplayTime(meeting.endTime)} in ${meeting.room.name}`}</span>
                      <BorderlessButton
                        id={`editButton${meeting.id}`}
                        variant={VARIANT.INFO}
                        onClick={
                          (): void => {
                            setCurrentMeetingId(meeting.id);
                            setCurrentDay(meeting.day);
                            setCurrentStartTime(meeting.startTime);
                            setCurrentEndTime(meeting.endTime);
                            setCurrentRoom(meeting.room);
                          }
                        }
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </BorderlessButton>
                    </>
                  )
              }
            </ListLayout>
          )
        )}
      </ul>
      <VerticalSpace />
      <ButtonLayout>
        <Button
          id="addNewTimeButton"
          onClick={
            (): void => {}
          }
          variant={VARIANT.SECONDARY}
        >
          Add New Time
        </Button>
      </ButtonLayout>
    </div>
  );
};
