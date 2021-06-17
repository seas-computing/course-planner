import React, {
  useEffect, useState, ReactElement, useContext,
} from 'react';
import { getRoomAvailability } from 'client/api/rooms';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomSelectionTable from './RoomSelectionTable';
import RoomRequest from '../../../../common/dto/room/RoomRequest.dto';
import { MessageContext } from '../../../context';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from '../../../classes';

interface RoomSelectionProps {
  /** The day and time for which a room should be selected */
  roomRequestData?: RoomRequest;
  /** The handler that will be called when a room is chosen */
  roomHandler: (roomData: RoomResponse) => void;
}

/**
 * Wrapper component that handles fetching the list of rooms based on the data
 * provided, then rendering it into a table
 */

const RoomSelection = (
  props: RoomSelectionProps
): ReactElement<RoomSelectionProps> => {
  const {
    roomRequestData, roomHandler,
  } = props;
  const [roomList, setRoomList] = useState<RoomResponse[]>([]);
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
    }
  },
  [
    dispatchMessage,
    setRoomList,
    setFetching,
    roomRequestData,
  ]);

  return (
    <RoomSelectionTable
      roomList={roomList}
      addButtonHandler={roomHandler}
      dataFetching={isFetching}
    />
  );
};

RoomSelection.defaultProps = {
  roomRequestData: null,
};

export default RoomSelection;
