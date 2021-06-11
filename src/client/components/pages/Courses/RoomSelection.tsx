import React, { useEffect, useState, ReactElement } from 'react';
import { getRoomAvailability } from 'client/api/rooms';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomSelectionTable from './RoomSelectionTable';
import RoomRequest from '../../../../common/dto/room/RoomRequest.dto';

interface RoomSelectionProps {
  roomRequestData?: RoomRequest;
  roomHandler: (arg0: string, arg1: string) => void;
}

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
