import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LocationAPI } from 'client/api';
import { AppMessage, MESSAGE_ACTION, MESSAGE_TYPE } from 'client/classes';
import { MessageContext } from 'client/context';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import {
  ALIGN,
  BorderlessButton,
  LoadSpinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadingCell,
  TableRow,
  VARIANT,
} from 'mark-one';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import React, {
  FunctionComponent, ReactElement, useContext, useEffect, useState,
} from 'react';

const RoomAdmin: FunctionComponent = (): ReactElement => {
  /**
   * Saves a complete list of rooms in local state
   */
  const [
    fullRoomList,
    setFullRoomList,
  ] = useState<RoomAdminResponse[]>([]);

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Indicates whether the room data is in the process of being fetched
   */
  const [fetching, setFetching] = useState(false);

  /**
   * Gets the rooms data from the server.
   * If it fails, display a message for the user.
   */
  useEffect((): void => {
    setFetching(true);
    LocationAPI.getAdminRooms()
      .then((rooms): void => {
        setFullRoomList(rooms);
      })
      .catch((): void => {
        dispatchMessage({
          message: new AppMessage(
            'Unable to get room data from server. If the problem persists, contact SEAS Computing',
            MESSAGE_TYPE.ERROR
          ),
          type: MESSAGE_ACTION.PUSH,
        });
      })
      .finally((): void => {
        setFetching(false);
      });
  }, [
    dispatchMessage,
  ]);

  return (
    <div className="room-admin-table">
      {fetching
        ? (
          <div>
            <LoadSpinner>Fetching Room Data</LoadSpinner>
          </div>
        )
        : (
          <Table>
            <TableHead>
              <TableRow isStriped>
                <TableHeadingCell scope="col">Campus</TableHeadingCell>
                <TableHeadingCell scope="col">Building</TableHeadingCell>
                <TableHeadingCell scope="col">Room Name</TableHeadingCell>
                <TableHeadingCell scope="col">Capacity</TableHeadingCell>
                <TableHeadingCell scope="col">Edit</TableHeadingCell>
              </TableRow>
            </TableHead>
            <TableBody isScrollable>
              {fullRoomList.map((room, i): ReactElement<TableRowProps> => (
                <TableRow isStriped={i % 2 === 1} key={room.id}>
                  <TableCell>{room.building.campus.name}</TableCell>
                  <TableCell>{room.building.name}</TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell alignment={ALIGN.CENTER}>
                    <BorderlessButton
                      id={`edit-${room.id}`}
                      alt={`Edit room information for ${room.building.name} ${room.name}`}
                      variant={VARIANT.INFO}
                      onClick={(): void => {}}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </BorderlessButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
    </div>
  );
};

export default RoomAdmin;
