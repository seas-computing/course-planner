import { getRoomScheduleForSemester, LocationAPI } from 'client/api';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MenuFlex } from 'client/components/general';
import { VerticalSpace } from 'client/components/layout';
import { MessageContext, MetadataContext } from 'client/context';
import { useStoredState } from 'client/hooks/useStoredState';
import { DAY, TERM } from 'common/constants';
import { dayEnumToString } from 'common/constants/day';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import { RoomScheduleResponseDTO } from 'common/dto/schedule/roomSchedule.dto';
import { PGTime } from 'common/utils/PGTime';
import { termEnumToTitleCase } from 'common/utils/termHelperFunctions';
import { toTitleCase } from 'common/utils/util';
import {
  Combobox,
  Dropdown,
  LoadSpinner,
  NoteText,
  POSITION,
} from 'mark-one';
import React, {
  FunctionComponent, useCallback, useContext, useEffect, useState,
} from 'react';
import { CourseListing, SessionBlock, WeekBlock } from '../Schedule/blocks';
import DayBlock from '../Schedule/blocks/DayBlock';
import { SemesterSelection } from '../Schedule/SchedulePage';

/**
 * Parameters for how the schedule view should be displayed. Currently using
 * static values.
 *
 * TODO: Consider deriving start and end times from schedule data
 */
const FIRST_HOUR = 8;
const LAST_HOUR = 22;
const MINUTE_RESOLUTION = 5;
const days = Object.values(DAY).map(dayEnumToString);
const rowHeight = '0.5em';

/**
 * Displays the course schedule for a particular room and semester
 */
const RoomSchedule: FunctionComponent = () => {
  // Convert the range of hours covered by our Schedule to a number of
  // css-grid rows
  const numRows = ((LAST_HOUR - FIRST_HOUR) * 60)
      / MINUTE_RESOLUTION;

  /**
   * Saves a complete list of rooms in local state
   */
  const [
    fullRoomList,
    setFullRoomList,
  ] = useState<RoomResponse[]>([]);

  /**
   * Keeps track of the currently selected room
   */
  const [
    currentRoom,
    setCurrentRoom,
  ] = useState<{id: string, displayName: string}>({
    id: '',
    displayName: '',
  });

  /**
   * Provides the current Academic Year from the server
   * Later, we may add the current Term to metadata
   */
  const { currentAcademicYear, semesters } = useContext(MetadataContext);
  // This hardcoded academic year will be replaced with the above. Since there
  // is no current data for Fall 2022, we are using 2020 as the year for now.

  // const currentAcademicYear = 2020;

  /**
   * Keeps track of the currently selected term
   */
  const [
    selectedSemester,
    setSelectedSemester,
  ] = useStoredState<SemesterSelection>('ROOM_SCHEDULE_SEMESTER_SELECTION');

  /**
   * Whether an API request is in progress
   */
  const [isFetching, setFetching] = useState<boolean>(false);

  /**
   * Map the metadata semesters into Dropdown-compatible options
   */
  const semesterOptions = semesters
    .map((semester) => ({
      value: semester,
      label: toTitleCase(semester),
    }));

  /**
   * Update handler for the dropdown, which passes the selected term/year combo
   * into the state value
   */
  const updateTerm = ({
    target: {
      value,
    },
  }: React.ChangeEvent<HTMLSelectElement>) => {
    if (value) {
      const [term, year] = value.split(' ');
      setSelectedSemester({
        term: (term.toUpperCase() === TERM.SPRING) ? TERM.SPRING : TERM.FALL,
        calendarYear: parseInt(year, 10),
      });
    }
  };

  /**
   * Maintain the complete room schedule data from the API in state
   */
  const [schedule, setSchedule] = useState<RoomScheduleResponseDTO[]>([]);

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  const loadRooms = useCallback(async (): Promise<void> => {
    try {
      const roomList = await LocationAPI.getRooms();
      setFullRoomList(roomList);
    } catch (e) {
      dispatchMessage({
        message: new AppMessage(
          'Unable to get room data from server. If the problem persists, contact SEAS Computing',
          MESSAGE_TYPE.ERROR
        ),
        type: MESSAGE_ACTION.PUSH,
      });
    }
  }, [dispatchMessage]);

  /**
   * Gets the rooms data from the server.
   * If it fails, display a message for the user.
   */
  useEffect((): void => {
    void loadRooms();
  }, [loadRooms]);

  /**
   * When the page loads, set the selectedSemester to the present Semester
   */
  useEffect(():void => {
    if (!selectedSemester) {
      const today = new Date();
      // Check if current month is later than or equal to July
      if (today.getMonth() >= 6) {
        setSelectedSemester({
          term: TERM.FALL,
          calendarYear: currentAcademicYear - 1,
        });
      } else {
        setSelectedSemester({
          term: TERM.SPRING,
          calendarYear: currentAcademicYear,
        });
      }
    }
  }, [currentAcademicYear, selectedSemester, setSelectedSemester]);

  /**
   * Fetch the schedule data from the server, store it in state to be used to
   * render the room schedule table.
   */
  useEffect((): void => {
    if (selectedSemester && currentRoom.id) {
      setFetching(true);
      const { term, calendarYear } = selectedSemester;
      getRoomScheduleForSemester(currentRoom.id, calendarYear, term)
        .then((data):void => {
          if (data.length === 0) {
            dispatchMessage({
              message: new AppMessage(
                `There is no schedule data for ${termEnumToTitleCase(selectedSemester.term)} ${selectedSemester.calendarYear}.`,
                MESSAGE_TYPE.ERROR
              ),
              type: MESSAGE_ACTION.PUSH,
            });
          }
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
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [
    currentRoom,
    dispatchMessage,
    setFetching,
    selectedSemester,
    setSchedule,
  ]);

  return (
    <div className="roomSchedule">
      <VerticalSpace>
        <MenuFlex>
          {selectedSemester && (
            <>
              <Dropdown
                id="room-schedule-semester-selector"
                name="room-schedule-semester-selector"
                label="Select Semester"
                labelPosition={POSITION.LEFT}
                value={`${selectedSemester.term} ${selectedSemester.calendarYear}`}
                options={semesterOptions}
                onChange={updateTerm}
              />
              <NoteText>
                {currentRoom.displayName
                  ? `Current Room: ${currentRoom.displayName}`
                  : 'Current Room: None Selected'}
              </NoteText>
              <Combobox
                options={fullRoomList
                  .map((room): { value: string; label: string; } => ({
                    label: room.name,
                    value: room.id,
                  }))}
                currentValue={null}
                label="Select a room"
                isLabelVisible={false}
                placeholder="Select a room"
                onOptionSelected={({
                  selectedItem: {
                    value: id, label: displayName,
                  },
                }) => {
                  setCurrentRoom({ id, displayName });
                }}
                filterFunction={(option, inputValue) => {
                  const re = new RegExp(inputValue, 'i');
                  return re.test(option.label);
                }}
              />
            </>
          )}
        </MenuFlex>
      </VerticalSpace>
      {currentRoom.id === ''
      && (
        <NoteText>
          Please select a room to view the schedule.
        </NoteText>
      )}
      {isFetching
      && (
        <LoadSpinner>
          Fetching Room Schedule
        </LoadSpinner>
      )}
      {!isFetching && currentRoom.id !== ''
      && (
        <WeekBlock
          firstHour={FIRST_HOUR}
          numRows={numRows}
          numColumns={days.length}
          rowHeight={rowHeight}
          minuteResolution={MINUTE_RESOLUTION}
          onClick={() => {}}
        >
          {days.map((day, col) => (
            <DayBlock
              key={day}
              column={col}
              heading={day}
              numRows={numRows}
              rowHeight={rowHeight}
            >
              {schedule
                .reduce<SessionBlock[]>((blocks, {
                id: sessionId,
                catalogNumber,
                title,
                startHour,
                startMinute,
                endHour,
                endMinute,
                duration,
                weekday,
                faculty,
              }) => {
                if (dayEnumToString(weekday) === day) {
                  const resolvedStartRow = Math.round(
                  // Convert the start time and duration of the course to a
                  // css-grid row
                    (((startHour - FIRST_HOUR) * 60) + startMinute)
                    / MINUTE_RESOLUTION
                    // Add one to account for the header row
                  ) + 1;
                  const resolvedDuration = Math.round(
                    duration / MINUTE_RESOLUTION
                  );
                  const displayStartTime = PGTime.toDisplay(
                    `${startHour}:${startMinute.toString().padStart(2, '0')}`
                  );
                  const displayEndTime = PGTime.toDisplay(
                    `${endHour}:${endMinute.toString().padStart(2, '0')}`
                  );
                  const facultyList: string = faculty
                    .map(({ displayName }) => displayName).join('; ');
                  return [...blocks, (
                    <SessionBlock
                      isFaded={false}
                      isPopoverVisible={false}
                      key={sessionId}
                      prefix={catalogNumber.split(' ')[0]}
                      catalogNumber={catalogNumber}
                      startRow={resolvedStartRow}
                      duration={resolvedDuration}
                      popovers={[]}
                    >
                      <>
                        <CourseListing>
                          {`Course: ${title}`}
                        </CourseListing>
                        <CourseListing>
                          {`Faculty: ${facultyList}`}
                        </CourseListing>
                        <CourseListing>
                          {`Day: ${day}`}
                        </CourseListing>
                        <CourseListing>
                          {`Time: ${displayStartTime} - ${displayEndTime}`}
                        </CourseListing>
                      </>
                    </SessionBlock>
                  )];
                }
                return blocks;
              }, [])}
            </DayBlock>
          ))}
        </WeekBlock>
      )}
    </div>
  );
};

export default RoomSchedule;
