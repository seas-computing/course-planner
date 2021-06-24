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
  Dropdown,
  TableRowHeadingCell,
} from 'mark-one';
import RoomResponse from 'common/dto/room/RoomResponse.dto';

interface RoomSelectionTableProps {
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
 * Formats the meeting data for the "Availability" column
 */
const displayAvailability = (roomData: RoomResponse) => {
  const { campus, meetingTitles } = roomData;
  if (campus === 'FAS') {
    return 'Check FAS Availability';
  }
  if (meetingTitles.length > 0) {
    return `No (${meetingTitles.join(', ')})`;
  }
  return 'Yes';
};

/**
 * Renders the list of rooms into the table interface
 */

const RoomSelectionTable = (
  { roomList, addButtonHandler }: RoomSelectionTableProps
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
          {roomList.map((roomData, index) => {
            const {
              id, campus, name, capacity,
            } = roomData;
            return (
              <TableRow key={id} isStriped={index % 2 !== 0}>
                <TableCell>{campus}</TableCell>
                <TableRowHeadingCell scope="row">{name}</TableRowHeadingCell>
                <TableCell>{capacity}</TableCell>
                <TableCell>
                  {displayAvailability(roomData)}
                </TableCell>
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
    </>
  );
};

export default RoomSelectionTable;
