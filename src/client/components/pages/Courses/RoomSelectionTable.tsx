import React, { ReactElement, useState, ChangeEvent } from 'react';
import styled from 'styled-components';
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
  fromTheme,
} from 'mark-one';
import RoomResponse from 'common/dto/room/RoomResponse.dto';

interface RoomSelectionTableProps {
  /** Whether an asynchronous request to the server has been made */
  dataFetching?: boolean;
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
 * A textbox that will appear before a meeting day/time has been selected
 */

const RoomSelectionTablePrompt = styled.div`
  border: ${fromTheme('border', 'light')};
  border-top: none;
  text-align: center;
  font-weight: ${fromTheme('font', 'bold', 'weight')};
  font-size: ${fromTheme('font', 'bold', 'size')};
  font-family: ${fromTheme('font', 'bold', 'family')};
  padding: ${fromTheme('ws', 'medium')};
`;

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
      {dataFetching && <LoadSpinner>Searching for Rooms</LoadSpinner>}
      {!dataFetching && roomList.length === 0 && (
        <RoomSelectionTablePrompt>
          Add Meeting Time to view room availability
        </RoomSelectionTablePrompt>
      )}
    </>
  );
};

RoomSelectionTable.defaultProps = {
  dataFetching: false,
};

export default RoomSelectionTable;
