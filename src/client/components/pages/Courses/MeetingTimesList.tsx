import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { faAngleDown, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DAY, { dayEnumToString, days } from 'common/constants/day';
import { meetingTimeSlots } from 'common/constants/timeslots';
import { CourseInstanceResponseMeeting } from 'common/dto/courses/CourseInstanceResponse';
import { MeetingRoomResponse } from 'common/dto/meeting/MeetingResponse.dto';
import {
  convert12To24HourTime,
  convertTo12HourDisplayTime,
} from 'common/utils/timeHelperFunctions';
import {
  BorderlessButton,
  Button,
  ButtonDropdownMenu,
  ButtonDropdownMenuItem,
  Dropdown,
  fromTheme,
  TextInput,
  ValidationErrorMessage,
  VARIANT,
} from 'mark-one';
import { ButtonLayout } from '../../general';

interface MeetingTimesListProps {
  /**
   * The current existing meetings for this course instance
   */
  meetings: CourseInstanceResponseMeeting[];
  /**
   * Handles updating the state of the list of meetings in the
   * parent component (MeetingModal)
   */
  onChange: (meetings: CourseInstanceResponseMeeting[]) => void;
  saving: boolean;
}

interface StyledMeetingRowProps {
  /** If true, the user is currently editing a meeting entry */
  isRowExpanded: boolean;
}

const generateGrid = (isRowExpanded: boolean): string => {
  if (isRowExpanded) {
    return `"delete day timeslot start end ."
            ". error error error error error"
            ". room room room room room"
            ". . . . showclose showclose"`;
  }
  return '"delete info edit"';
};

const StyledMeetingRow = styled.li<StyledMeetingRowProps>`
  display: grid;
  align-items: center;
  border-bottom: ${fromTheme('border', 'light')};
  grid-template-areas: ${({ isRowExpanded }) => (
    generateGrid(isRowExpanded)
  )};
  grid-template-columns: min-content;
  grid-template-rows: ${({ isRowExpanded }) => (
    isRowExpanded
      ? 'repeat(4, minmax(22px, auto));'
      : ''
  )};
  padding: ${fromTheme('ws', 'xsmall')} 0px;
`;

const StyledMeetingInfo = styled.span`
  grid-area: info;
`;

const StyledDay = styled.span`
  grid-area: day;
  display: inline-block;
  max-width: max-content;
  min-width: max-content;
`;

const StyledTimeslot = styled.span`
  grid-area: timeslot;
  height: 100%;
  justify-self: end;
`;

const StyledStart = styled.span`
  grid-area: start;
  min-width: max-content;
`;

const StyledEnd = styled.span`
  grid-area: end;
  min-width: max-content;
`;

const StyledError = styled.span`
    grid-area: error;
    justify-self: start;
`;

const StyledRoom = styled.div`
    grid-area: room;
`;

const StyledDeleteButton = styled.span`
  grid-area: delete;
  justify-self: start;
`;

const StyledEditButton = styled.span`
  grid-area: edit;
  justify-self: end;
`;

const StyledShowCloseButtons = styled.div`
    grid-area: showclose;
    justify-self: end;
    > * {
      margin-left: ${fromTheme('ws', 'xsmall')};
    }
`;

const StyledButtonLayout = styled(ButtonLayout)`
  margin-top: ${fromTheme('ws', 'xsmall')};
  margin-bottom: ${fromTheme('ws', 'xsmall')};
`;

/**
 * The meeting times section of the modal that allows users to edit meetings
 * for a particular course instance.
 */
export const MeetingTimesList
: FunctionComponent<MeetingTimesListProps> = function ({
  meetings,
  saving,
  onChange,
}): ReactElement {
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

  /**
   * Used to create a temporary unique ID for new meetings on the client. A permanent UUID will be assigned as a result of the server request
   */
  const [
    newMeetingIndex,
    setNewMeetingIndex,
  ] = useState(0);

  /**
   * The fields of the existing meeting are checked to make sure they are non-empty.
   * The entered start and end times are compared to make sure the start time is
   * not later than the end time. In either case, an error is set.
   */
  const validateTimes = (): boolean => {
    if (currentMeetingId) {
      if (currentDay === '' as DAY || currentStartTime === '' || currentEndTime === '') {
        setMeetingTimeError('Please provide a day and start/end times before proceeding.');
        return false;
      }
      if (currentStartTime >= currentEndTime) {
        setMeetingTimeError('End time must be later than start time.');
        return false;
      }
    }
    setMeetingTimeError('');
    return true;
  };

  useEffect(() => {
    if (saving) {
      validateTimes();
    }
  });

  /**
   * Retrieves and is used to update the current list of meetings, which lives
   * in the state of the parent component (MeetingModal)
   */
  const getCurrentMeetings = () => meetings
    .map((meeting: CourseInstanceResponseMeeting) => (
      meeting.id === currentMeetingId
        ? {
          ...meeting,
          day: currentDay,
          startTime: currentStartTime,
          endTime: currentEndTime,
          room: currentRoom,
        }
        : meeting));

  return (
    <div className="meeting-times-section">
      <ul>
        {meetings.map(
          (meeting) => (
            <StyledMeetingRow
              key={meeting.id}
              isRowExpanded={meeting.id === currentMeetingId}
            >
              <StyledDeleteButton>
                <BorderlessButton
                  id={`deleteButton${meeting.id}`}
                  variant={VARIANT.DANGER}
                  onClick={
                    (): void => {}
                  }
                >
                  <FontAwesomeIcon icon={faTrash} />
                </BorderlessButton>
              </StyledDeleteButton>
              {
                meeting.id === currentMeetingId
                  ? (
                    <>
                      <StyledDay>
                        <Dropdown
                          id="meetingDay"
                          name="meetingDay"
                          label="Meeting Day"
                          options={[{ value: '', label: '' }]
                            .concat(days.map((day) => ({
                              value: day,
                              label: dayEnumToString(day),
                            })))}
                          value={currentDay}
                          onChange={(event
                          : React.ChangeEvent<HTMLSelectElement>): void => {
                            setCurrentDay(event.currentTarget.value as DAY);
                          }}
                          hideError
                          isRequired
                          isLabelVisible={false}
                        />
                      </StyledDay>
                      <StyledTimeslot>
                        <ButtonDropdownMenu
                          alt="Timeslot Button"
                          label={<FontAwesomeIcon icon={faAngleDown} size="sm" />}
                          variant={VARIANT.BASE}
                        >
                          {meetingTimeSlots.map(({
                            label,
                            start,
                            end,
                          }) => (
                            <ButtonDropdownMenuItem
                              onClick={() => {
                                setCurrentStartTime(start);
                                setCurrentEndTime(end);
                              }}
                              key={label}
                            >
                              {label}
                            </ButtonDropdownMenuItem>
                          ))}
                        </ButtonDropdownMenu>
                      </StyledTimeslot>
                      <StyledStart>
                        <TextInput
                          id="meetingStartTime"
                          name="meetingStartTime"
                          label="Meeting Start Time"
                          type="time"
                          value={currentStartTime !== '' ? convert12To24HourTime(currentStartTime) : ''}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>)
                          : void => {
                            setCurrentStartTime(event.currentTarget.value);
                          }}
                          hideError
                          isRequired
                          isLabelVisible={false}
                        />
                      </StyledStart>
                      <StyledEnd>
                        <TextInput
                          id="meetingEndTime"
                          name="meetingEndTime"
                          label="Meeting End Time"
                          type="time"
                          value={currentEndTime !== '' ? convert12To24HourTime(currentEndTime) : ''}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>)
                          : void => {
                            setCurrentEndTime(event.currentTarget.value);
                          }}
                          hideError
                          isRequired
                          isLabelVisible={false}
                        />
                      </StyledEnd>
                      <StyledError>
                        <ValidationErrorMessage
                          id="meetingTimeErrorMessage"
                        >
                          {meetingTimeError}
                        </ValidationErrorMessage>
                      </StyledError>
                      <StyledRoom>
                        Room:
                        {` ${currentRoom !== null ? currentRoom.name : ''}`}
                      </StyledRoom>
                      <StyledShowCloseButtons>
                        <Button
                          id="closeButton"
                          onClick={
                            (): void => {
                              // Close the current meeting only if there are no validation errors
                              if (validateTimes()) {
                                onChange(getCurrentMeetings());
                                setCurrentMeetingId(null);
                              }
                            }
                          }
                          variant={VARIANT.SECONDARY}
                        >
                          Close
                        </Button>
                        <Button
                          id="showRoomsButton"
                          onClick={
                            (): void => {
                              if (validateTimes()) {
                                onChange(getCurrentMeetings());
                              }
                            }
                          }
                          variant={VARIANT.PRIMARY}
                        >
                          Show Rooms
                        </Button>
                      </StyledShowCloseButtons>
                    </>
                  )
                  : (
                    <>
                      <StyledMeetingInfo>
                        {`${dayEnumToString(meeting.day)}, ${convertTo12HourDisplayTime(meeting.startTime)} to ${convertTo12HourDisplayTime(meeting.endTime)}`}
                        <div>
                          {`${meeting.room !== null ? ` in ${meeting.room.name}` : ''}`}
                        </div>
                      </StyledMeetingInfo>
                      <StyledEditButton>
                        <BorderlessButton
                          id={`editMeetingButton${meeting.id}`}
                          variant={VARIANT.INFO}
                          onClick={
                            (): void => {
                              if (validateTimes()) {
                                onChange(getCurrentMeetings());
                                setCurrentMeetingId(meeting.id);
                                setCurrentDay(meeting.day);
                                setCurrentStartTime(meeting.startTime);
                                setCurrentEndTime(meeting.endTime);
                                setCurrentRoom(meeting.room);
                              }
                            }
                          }
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </BorderlessButton>
                      </StyledEditButton>
                    </>
                  )
              }
            </StyledMeetingRow>
          )
        )}
      </ul>
      <StyledButtonLayout>
        <Button
          id="addNewTimeButton"
          onClick={
            (): void => {
              // Close the current meeting only if there are no validation errors
              if (validateTimes()) {
                // If there is a meeting currently being edited, get the data
                // currently being edited and call onChange to update the meetings
                let updatedMeetings = meetings;
                if (currentMeetingId != null) {
                  updatedMeetings = getCurrentMeetings();
                  setCurrentMeetingId(null);
                }
                // Generate a new meeting row using a newly created meeting ID via the newMeetingIndex
                const newMeeting = {
                  id: `newMeeting${newMeetingIndex}`,
                  day: '' as DAY,
                  startTime: '',
                  endTime: '',
                  room: null,
                };
                updatedMeetings = [...updatedMeetings, newMeeting];
                // update the meetings
                onChange(updatedMeetings);
                setCurrentMeetingId(newMeeting.id);
                setNewMeetingIndex(newMeetingIndex + 1);
                setCurrentDay(newMeeting.day);
                setCurrentStartTime(newMeeting.startTime);
                setCurrentEndTime(newMeeting.endTime);
                setCurrentRoom(newMeeting.room);
              }
            }
          }
          variant={VARIANT.SECONDARY}
        >
          Add New Time
        </Button>
      </StyledButtonLayout>
    </div>
  );
};
