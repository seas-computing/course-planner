import React, { ReactElement, useState, ChangeEvent } from 'react';
import {
  Table,
  TableRow,
  TableHead,
  TableHeadingCell,
  TableCell,
  TableBody,
  VARIANT,
  Button,
  LoadSpinner,
  Dropdown,
  TableRowHeadingCell,
} from 'mark-one';
import RoomResponse from 'common/dto/room/RoomResponse.dto';

interface RoomSelectionTableProps {
  /** Whether an asynchronous request to the server has been made */
  dataFetching: boolean;
  /** The list of rooms to show in the list */
  roomList: RoomResponse[];
  /** A handler to be called when the add button is clicked */
  addButtonHandler: (roomData: RoomResponse) => void;
}

/**
 * The allowed values for Availability filter in the room table
 */

enum AVAILABILITY {
  ALL='All',
  AVAILABLE='Available',
  UNAVAILABLE='Unavailable',
  CHECK='Check FAS availability'
}

/**
 * Renders the list of rooms into the table interface
 */

const RoomSelectionTable = (
  { roomList, addButtonHandler, dataFetching }: RoomSelectionTableProps
): ReactElement<RoomSelectionTableProps> => {
  const [
    availabilityFilter,
    setAvailabilityFilter,
  ] = useState<AVAILABILITY>(AVAILABILITY.ALL);
  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadingCell rowSpan={2}>
              Campus
            </TableHeadingCell>
            <TableHeadingCell rowSpan={2}>
              Room
            </TableHeadingCell>
            <TableHeadingCell rowSpan={2}>
              Capacity
            </TableHeadingCell>
            <TableHeadingCell rowSpan={1}>
              Availability
            </TableHeadingCell>
            <TableHeadingCell rowSpan={2}>
              Add
            </TableHeadingCell>
          </TableRow>
          <TableRow noHighlight>
            <TableHeadingCell>
              <Dropdown
                hideError
                id="availability-filter"
                label="Change to filter the list by whether rooms are available"
                isLabelVisible={false}
                onChange={
                  (evt: ChangeEvent<HTMLSelectElement>): void => {
                    setAvailabilityFilter(evt.target.value as AVAILABILITY);
                  }
                }
                name="availability-filter"
                value={availabilityFilter}
                options={
                  Object.values(AVAILABILITY)
                    .map((value) => ({ value, label: value }))
                }
              />
            </TableHeadingCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!dataFetching && roomList.map((roomData, index) => {
            const {
              id, campus, name, capacity, meetingTitles
            } = roomData;
            return (
              <TableRow key={id} isStriped={index % 2 !== 0}>
                <TableCell>{campus}</TableCell>
                <TableRowHeadingCell scope="row">{name}</TableRowHeadingCell>
                <TableCell>{capacity}</TableCell>
                <TableCell>{meetingTitles.join(',\n')}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => { addButtonHandler(roomData); }}
                    variant={VARIANT.POSITIVE}
                  >
                    Add

                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {dataFetching && <LoadSpinner>Searching for Rooms</LoadSpinner>}
      {roomList === null && (
        'Add Meeting Time to view room availability'
      )}
    </>
  );
};
export default RoomSelectionTable;
