import { LocationAPI } from 'client/api/rooms';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MenuFlex } from 'client/components/general';
import { VerticalSpace } from 'client/components/layout';
import { MessageContext } from 'client/context';
import { TERM } from 'common/constants';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import { Combobox, NoteText } from 'mark-one';
import React, {
  FunctionComponent, useCallback, useContext, useEffect, useState,
} from 'react';

/**
 * Displays the course schedule for a particular room and semester
 */
const RoomSchedule: FunctionComponent = () => {
  const currentTerm = TERM.FALL;
  const currentAcademicYear = 2020;
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
   * Gets the rooms data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    void loadRooms();
  }, [loadRooms]);

  return (
    <div className="roomSchedule">
      <VerticalSpace>
        <MenuFlex>
          <NoteText>
            {`Current Semester: ${currentTerm} ${currentAcademicYear}`}
          </NoteText>
          <NoteText>
            {currentRoom.displayName
              ? `Current Room: ${currentRoom.displayName}`
              : 'Current Room: None Selected'}
          </NoteText>
          <Combobox
            options={fullRoomList
              .map((room):
              {value: string; label: string} => ({
                label: room.name,
                value: room.id,
              }))}
            currentValue={null}
            label="Select a room"
            isLabelVisible={false}
            placeholder="Select a room"
            onOptionSelected={({
              selectedItem: {
                value: id,
                label: displayName,
              },
            }) => {
              setCurrentRoom({ id, displayName });
            }}
            filterFunction={(option, inputValue) => {
              const re = new RegExp(inputValue, 'i');
              return re.test(option.label);
            }}
          />
        </MenuFlex>
      </VerticalSpace>
    </div>
  );
};

export default RoomSchedule;
