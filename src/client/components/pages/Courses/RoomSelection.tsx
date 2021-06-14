import React, { useEffect, useState, ReactElement } from 'react';
import { getRoomAvailability } from 'client/api/rooms';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomSelectionTable from './RoomSelectionTable';
import RoomRequest from '../../../../common/dto/room/RoomRequest.dto';

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

  useEffect(() => {
    if (roomRequestData) {
      setFetching(true);
      getRoomAvailability(roomRequestData)
        .then(setRoomList)
        .catch()
        .finally(() => { setFetching(false); });
    }
  },
  [
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
