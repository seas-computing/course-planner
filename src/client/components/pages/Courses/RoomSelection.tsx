import React, {
  useEffect, useState, ReactElement, useContext,
} from 'react';
import styled from 'styled-components';
import { getRoomAvailability } from 'client/api/rooms';
import { fromTheme, LoadSpinner } from 'mark-one';
import RoomMeetingResponse from 'common/dto/room/RoomMeetingResponse.dto';
import RoomSelectionTable from './RoomSelectionTable';
import RoomRequest from '../../../../common/dto/room/RoomRequest.dto';
import { MessageContext } from '../../../context';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from '../../../classes';
import { CourseInstanceResponseMeeting } from '../../../../common/dto/courses/CourseInstanceResponse';

interface RoomSelectionProps {
  /** The day and time for which a room should be selected */
  roomRequestData?: RoomRequest;
  /** The handler that will be called when a room is chosen */
  roomHandler: (
    roomData: CourseInstanceResponseMeeting['room']
  ) => void;
  /** The id of the room that is currently assigned to the meeting */
  currentRoomId?: string;
}

/**
 * A textbox that will appear before a meeting day/time has been selected
 */

const RoomSelectionPrompt = styled.div`
  border: ${fromTheme('border', 'light')};
  border-top: none;
  text-align: center;
  font-weight: ${fromTheme('font', 'bold', 'weight')};
  font-size: ${fromTheme('font', 'bold', 'size')};
  font-family: ${fromTheme('font', 'bold', 'family')};
  padding: ${fromTheme('ws', 'medium')};
`;

/**
 * The message shown inside the Room Selection prompt
 */
const roomSelectionPromptMessage = 'Add meeting time and click "Show Rooms" to view availability';

/**
 * Wrapper component that handles fetching the list of rooms based on the data
 * provided, then rendering it into a table
 */

const RoomSelection = ({
  roomRequestData, roomHandler, currentRoomId,
}: RoomSelectionProps): ReactElement<RoomSelectionProps> => {
  const [roomList, setRoomList] = useState<RoomMeetingResponse[]>([]);
  const [isFetching, setFetching] = useState<boolean>(false);

  const dispatchMessage = useContext(MessageContext);

  /**
   * Fetch the room availability list whenever the request time/day changes.
   */
  useEffect(() => {
    if (roomRequestData) {
      setFetching(true);
      getRoomAvailability(roomRequestData)
        .then(setRoomList)
        .catch((err: Error): void => {
          dispatchMessage({
            message: new AppMessage(err.message, MESSAGE_TYPE.ERROR),
            type: MESSAGE_ACTION.PUSH,
          });
        })
        .finally(() => { setFetching(false); });
    } else {
      setRoomList([]);
    }
  },
  [
    dispatchMessage,
    setRoomList,
    setFetching,
    roomRequestData,
  ]);

  return (
    <>
      <RoomSelectionTable
        roomList={roomList}
        addButtonHandler={roomHandler}
        currentRoomId={currentRoomId}
      />
      {isFetching && <LoadSpinner>Searching for Rooms</LoadSpinner>}
      {roomRequestData === null && (
        <RoomSelectionPrompt>{roomSelectionPromptMessage}</RoomSelectionPrompt>
      )}
    </>
  );
};

RoomSelection.defaultProps = {
  roomRequestData: null,
  currentRoomId: null,
};

export default RoomSelection;
