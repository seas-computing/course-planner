import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LocationAPI } from 'client/api';
import { AppMessage, MESSAGE_ACTION, MESSAGE_TYPE } from 'client/classes';
import { VerticalSpace } from 'client/components/layout';
import { MessageContext } from 'client/context';
import {
  ALIGN,
  BorderlessButton,
  Button,
  Dropdown,
  LoadSpinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadingCell,
  TableRow,
  TextInput,
  VARIANT,
} from 'mark-one';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import CreateRoomModal from './CreateRoomModal';
import EditRoomModal from './EditRoomModal';
import { listFilter } from '../Filter';
import { CAMPUS } from '../Courses/RoomSelectionTable';

/**
 * Keeps track of the information needed to display the edit room modal for a
 * specific room.
 */
interface EditRoomModalData {
  room?: RoomAdminResponse;
  visible: boolean;
}

const RoomAdmin: FunctionComponent = (): ReactElement => {
  /**
   * Saves a complete list of rooms in local state
   */
  const [
    fullRoomList,
    setFullRoomList,
  ] = useState<RoomAdminResponse[]>([]);

  /**
   * The campus name filter value
   */
  const [campusFilter, setCampusFilter] = useState('All');

  /**
   * The current buildings name filter value
   */
  const [buildingFilter, setBuildingFilter] = useState('All');

  /**
   * The building list used to populate buildings in the room admin table
   */
  const [buildingNameList, setBuildingNameList] = useState(
    [] as string[]
  );

  /**
   * The current room name filter value
   */
  const [roomFilter, setRoomFilter] = useState<string>('');

  /**
   * The capacity limit filter value
   */
  const [capacityFilter, setCapacity] = useState<string>('');

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Indicates whether the room data is in the process of being fetched
   */
  const [fetching, setFetching] = useState(false);

  /**
   * Indicates whether the Create Room modal is open
   */
  const [createRoomModalVisible, setCreateRoomModalVisible] = useState(false);

  /**
   * The current value of the edit room button
   */
  const editButtonRef: Ref<HTMLButtonElement> = useRef(null);

  /**
   * Set the ref focus for the edit button
   */
  const setEditButtonFocus = (): void => {
    setTimeout((): void => {
      if (editButtonRef.current) {
        editButtonRef.current.focus();
      }
    });
  };

  /**
   * Keeps track of the information related to the edit room modal
   */
  const [
    editRoomModalData,
    setEditRoomModalData,
  ] = useState<EditRoomModalData>({
    room: null,
    visible: false,
  });

  /**
   * Takes the specified room and displays a modal to edit the room information
   */
  const openEditRoomModal = useCallback(
    (room: RoomAdminResponse) => {
      setEditRoomModalData({ room, visible: true });
    },
    [setEditRoomModalData]
  );

  /**
   * Handles closing the edit room modal and setting the focus back to the
   * button that opened the modal.
   */
  const closeEditRoomModal = useCallback(() => {
    setEditRoomModalData({ room: null, visible: false });
    setEditButtonFocus();
  }, [setEditRoomModalData]);

  /**
   * Get all of the room information to populate the room admin table
   */
  const loadRooms = useCallback(async (): Promise<void> => {
    setFetching(true);
    try {
      const rooms = await LocationAPI.getAdminRooms();
      setFullRoomList(rooms);
      // populates all building information list from room admin
      const buildingsSet = new Set <string>();
      rooms.forEach((room) => buildingsSet.add(room.building.name));
      setBuildingNameList(Array.from(buildingsSet.values()));
    } catch (error) {
      dispatchMessage({
        message: new AppMessage(
          'Unable to get room data from server. If the problem persists, contact SEAS Computing',
          MESSAGE_TYPE.ERROR
        ),
        type: MESSAGE_ACTION.PUSH,
      });
    } finally {
      setFetching(false);
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
   * Populates building names for the building filter dropdown.
   */
  const buildingDropDown = buildingNameList.map((buildingName) => (
    { value: buildingName, label: buildingName }
  ));
  const filteredRoomList = (): RoomAdminResponse[] => {
    let allRoomList = [...fullRoomList];
    if (campusFilter !== 'All') {
      allRoomList = listFilter(
        allRoomList,
        { field: 'building.campus.name', value: campusFilter, exact: true }
      );
    }
    if (buildingFilter !== 'All') {
      allRoomList = listFilter(
        allRoomList,
        { field: 'building.name', value: buildingFilter, exact: true }
      );
    }
    allRoomList = listFilter(
      allRoomList,
      { field: 'name', value: roomFilter, exact: false }
    );
    if (capacityFilter) {
      allRoomList = allRoomList.filter(
        (room) => room.capacity >= parseInt(capacityFilter)
      );
    }
    return allRoomList;
  };
  /**
   * Keeps track of which edit room button was clicked to determine which
   * button should regain focus when edit room modal is closed
   */
  const [
    editedRoom,
    setEditedRoom,
  ] = useState<RoomAdminResponse>(null);

  return (
    <div className="room-admin-page">
      <VerticalSpace>
        <div className="create-room-button">
          <Button
            id="createRoom"
            onClick={(): void => {
              setCreateRoomModalVisible(true);
            }}
            variant={VARIANT.INFO}
          >
            Create New Room
          </Button>
        </div>
      </VerticalSpace>
      <>
        {fetching
          ? (
            <div>
              <LoadSpinner>Fetching Room Data</LoadSpinner>
            </div>
          )
          : (
            <div className="room-admin-table">
              <Table>
                <TableHead>
                  <TableRow isStriped>
                    <TableHeadingCell scope="col">Campus</TableHeadingCell>
                    <TableHeadingCell scope="col">Building</TableHeadingCell>
                    <TableHeadingCell scope="col">Room Name</TableHeadingCell>
                    <TableHeadingCell scope="col">Capacity</TableHeadingCell>
                    <TableHeadingCell scope="col">Edit</TableHeadingCell>
                  </TableRow>
                  <TableRow isStriped>
                    <TableHeadingCell scope="col">
                      <Dropdown
                        hideError
                        id="campus-filter"
                        label="Change to filter the list of rooms by campus"
                        isLabelVisible={false}
                        onChange={
                          (evt: ChangeEvent<HTMLSelectElement>): void => {
                            setCampusFilter(evt.target.value as CAMPUS);
                          }
                        }
                        name="campus-filter"
                        value={campusFilter}
                        options={
                          Object.values(CAMPUS)
                            .map((value) => ({ value, label: value }))
                        }
                      />

                    </TableHeadingCell>
                    <TableHeadingCell scope="col">
                      <Dropdown
                        hideError
                        id="building-filter"
                        label="Change to filter the list of rooms by building"
                        isLabelVisible={false}
                        options={
                          [{ value: 'All', label: 'All' }, ...buildingDropDown]
                        }
                        name="building-filter"
                        onChange={
                          (event:React.ChangeEvent<HTMLInputElement>) => {
                            setBuildingFilter(event.currentTarget.value);
                          }
                        }
                      />
                    </TableHeadingCell>
                    <TableHeadingCell scope="col">
                      <TextInput
                        id="room-filter"
                        name="room-filter"
                        placeholder="Filter by Room Name"
                        value={roomFilter}
                        label="Change to filter the list of rooms by room"
                        isLabelVisible={false}
                        hideError
                        onChange={
                          (event:React.ChangeEvent<HTMLInputElement>) => {
                            setRoomFilter(event.currentTarget.value);
                          }
                        }
                      />
                    </TableHeadingCell>
                    <TableHeadingCell scope="col">
                      <TextInput
                        id="capacity-filter"
                        name="capacity-filter"
                        placeholder="Enter Capacity"
                        value={capacityFilter}
                        label="Change to filter the list of rooms by capacity"
                        isLabelVisible={false}
                        hideError
                        onChange={
                          (event:React.ChangeEvent<HTMLInputElement>) => {
                            setCapacity(event.currentTarget.value);
                          }
                        }
                      />
                    </TableHeadingCell>
                    <TableHeadingCell scope="col"> </TableHeadingCell>
                  </TableRow>
                </TableHead>
                <TableBody isScrollable>
                  {filteredRoomList()
                    .map((room, i): ReactElement<TableRowProps> => (
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
                            onClick={(): void => {
                              openEditRoomModal(room);
                              setEditedRoom(room);
                            }}
                            forwardRef={
                              editedRoom ? editButtonRef : null
                            }
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </BorderlessButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <CreateRoomModal
                isVisible={createRoomModalVisible}
                onClose={(): void => {
                  setCreateRoomModalVisible(false);
                  window.setTimeout((): void => document.getElementById('createRoom').focus(), 0);
                }}
                onSuccess={async (): Promise<void> => {
                  // wait for the rooms to load before allowing the dialog to close
                  await loadRooms();
                  // display a success message after successful update and loading of rooms
                  dispatchMessage({
                    message: new AppMessage('Room was added.', MESSAGE_TYPE.SUCCESS),
                    type: MESSAGE_ACTION.PUSH,
                  });
                }}
              />
              <EditRoomModal
                isVisible={editRoomModalData.visible}
                currentRoom={editRoomModalData.room}
                onSuccess={async (): Promise<void> => {
                  // wait for the rooms to load before allowing the dialog to close
                  await loadRooms();
                  // display a success message after successful update and loading of rooms
                  dispatchMessage({
                    message: new AppMessage('Room was updated.', MESSAGE_TYPE.SUCCESS),
                    type: MESSAGE_ACTION.PUSH,
                  });
                }}
                onClose={closeEditRoomModal}
              />
            </div>
          )}
      </>
    </div>
  );
};

export default RoomAdmin;
