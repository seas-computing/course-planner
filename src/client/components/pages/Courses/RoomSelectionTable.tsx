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
import { CourseInstanceResponseMeeting } from '../../../../common/dto/courses/CourseInstanceResponse';

interface RoomSelectionTableProps {
  /** The list of rooms to show in the list */
  roomList: RoomResponse[];
  /** A handler to be called when the add button is clicked */
  addButtonHandler: (
    roomData: CourseInstanceResponseMeeting['room']
  ) => void;
  /** The id of the room currently assigned to the meeting being edited */
  currentRoomId?: string;
}

/**
 * The allowed values for Availability filter in the room table
 */

export enum AVAILABILITY {
  ALL='All',
  AVAILABLE='Available',
  UNAVAILABLE='Unavailable',
}

/**
 * Formats the meeting data for the "Availability" column
 */
const displayAvailability = (
  { id, campus, meetingTitles }: RoomResponse,
  currentRoomId: string
) => {
  if (id === currentRoomId) {
    return 'Current Room';
  }
  if (meetingTitles.length > 0) {
    return `No (${meetingTitles.join(', ')})`;
  }
  if (campus === 'FAS') {
    return 'Check FAS Availability';
  }
  return 'Yes';
};

/**
 * Renders the list of rooms into the table interface
 */

const RoomSelectionTable = (
  { roomList, addButtonHandler, currentRoomId }: RoomSelectionTableProps
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
          {roomList.filter(({ meetingTitles }) => {
            switch (availabilityFilter) {
              case AVAILABILITY.ALL:
                return true;
              case AVAILABILITY.AVAILABLE:
                return meetingTitles.length === 0;
              case AVAILABILITY.UNAVAILABLE:
                return meetingTitles.length > 0;
              default:
                return true;
            }
          }).map((roomData, index) => {
            const {
              id, campus, name, capacity, meetingTitles,
            } = roomData;
            const isUnavailable = meetingTitles.length > 0
              || id === currentRoomId;
            return (
              <TableRow key={id} isStriped={index % 2 !== 0}>
                <TableCell>{campus}</TableCell>
                <TableRowHeadingCell scope="row">{name}</TableRowHeadingCell>
                <TableCell>{capacity}</TableCell>
                <TableCell>
                  {displayAvailability(roomData, currentRoomId)}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => { addButtonHandler({ id, campus, name }); }}
                    variant={VARIANT.POSITIVE}
                    disabled={isUnavailable}
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

RoomSelectionTable.defaultProps = {
  currentRoomId: null,
};

export default RoomSelectionTable;
