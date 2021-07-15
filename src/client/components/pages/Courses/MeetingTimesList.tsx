import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import styled from 'styled-components';
import { faAngleDown, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DAY, { dayEnumToString, days } from 'common/constants/day';
import { meetingTimeSlots } from 'common/constants/timeslots';
import { CourseInstanceResponseMeeting } from 'common/dto/courses/CourseInstanceResponse';
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
  allMeetings: CourseInstanceResponseMeeting[];
  /**
   * The meeting that is currently being edited
   */
  currentEditMeeting: CourseInstanceResponseMeeting;
  /**
   * Handler for updating individual fields in the current meeting
   */
  updateCurrentEditMeeting: (
    update: Partial<CourseInstanceResponseMeeting>,
  ) => void;
  /**
   * Handler to be called when the Show Rooms button is clicked
   */
  showRoomsHandler: () => void;
  /**
   * Any validation erros that need to be addressed
   */
  meetingTimeError: string;
  /**
   * A handler to clear the current edit meeting, optionally opening a new one
   */
  closeCurrentEditMeeting: (newMeeting?: CourseInstanceResponseMeeting) => void;
  /**
   * A handler to delete a meeting from the current existing meetings of the
   * course instance
   */
  removeMeeting: (meeting: CourseInstanceResponseMeeting) => void;
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
  allMeetings,
  currentEditMeeting,
  updateCurrentEditMeeting,
  closeCurrentEditMeeting,
  showRoomsHandler,
  meetingTimeError,
  removeMeeting,
}): ReactElement {
  return (
    <div className="meeting-times-section">
      <ul>
        {allMeetings.map(
          (meeting, index) => {
            const meetingTimeString = `${dayEnumToString(meeting.day)}, ${
              convertTo12HourDisplayTime(meeting.startTime)
            } to ${
              convertTo12HourDisplayTime(meeting.endTime)
            }`;
            const meetingRoomString = meeting.room === null
              ? ''
              : ` in ${meeting.room.name}`;
            return (
              <StyledMeetingRow
                key={meeting.id}
                isRowExpanded={
                  currentEditMeeting && meeting.id === currentEditMeeting.id
                }
              >
                <StyledDeleteButton>
                  <BorderlessButton
                    alt={`Delete Meeting ${index + 1} on ${meetingTimeString}${meetingRoomString}`}
                    id={`delete-button-${meeting.id}`}
                    variant={VARIANT.DANGER}
                    onClick={
                      (): void => {
                        removeMeeting(meeting);
                      }
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </BorderlessButton>
                </StyledDeleteButton>
                {
                  currentEditMeeting && meeting.id === currentEditMeeting.id
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
                            value={currentEditMeeting.day}
                            onChange={(event
                            : React.ChangeEvent<HTMLSelectElement>): void => {
                              updateCurrentEditMeeting(
                                { day: event.currentTarget.value as DAY }
                              );
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
                                  updateCurrentEditMeeting({
                                    startTime: start,
                                    endTime: end,
                                  });
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
                            value={currentEditMeeting.startTime !== ''
                              ? convert12To24HourTime(
                                currentEditMeeting.startTime
                              )
                              : ''}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            )
                            : void => {
                              updateCurrentEditMeeting(
                                { startTime: event.target.value }
                              );
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
                            value={currentEditMeeting.endTime !== ''
                              ? convert12To24HourTime(
                                currentEditMeeting.endTime
                              )
                              : ''}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            )
                            : void => {
                              updateCurrentEditMeeting(
                                { endTime: event.target.value }
                              );
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
                          {currentEditMeeting.room
                        && currentEditMeeting.room.name}
                        </StyledRoom>
                        <StyledShowCloseButtons>
                          <Button
                            id="closeButton"
                            onClick={
                              (): void => {
                                closeCurrentEditMeeting(null);
                              }
                            }
                            variant={VARIANT.SECONDARY}
                          >
                            Close
                          </Button>
                          <Button
                            id="showRoomsButton"
                            onClick={showRoomsHandler}
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
                          {meetingTimeString}
                          <div>
                            {meetingRoomString}
                          </div>
                        </StyledMeetingInfo>
                        <StyledEditButton>
                          <BorderlessButton
                            alt={`Edit Meeting ${index + 1} on ${meetingTimeString}${meetingRoomString}`}
                            id={`editMeetingButton${meeting.id}`}
                            variant={VARIANT.INFO}
                            onClick={
                              (): void => {
                                closeCurrentEditMeeting(meeting);
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
            );
          }
        )}
      </ul>
      <StyledButtonLayout>
        <Button
          id="addNewTimeButton"
          onClick={() => {
            closeCurrentEditMeeting({
              id: `new-meeting-${allMeetings.length + 1}`,
              day: '' as DAY,
              startTime: '',
              endTime: '',
              room: null,
            });
          }}
          variant={VARIANT.SECONDARY}
        >
          Add New Time
        </Button>
      </StyledButtonLayout>
    </div>
  );
};
