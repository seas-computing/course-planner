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
  dataFetching: boolean;
  roomList: RoomResponse[];
  addButtonHandler: (arg0: string, arg1: string) => void;
}

enum AVAILABILITY {
  ALL='All',
  AVAILABLE='Available',
  UNAVAILABLE='Unavailable',
  CHECK='Check FAS availability'
}

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
          {!dataFetching && roomList.map(({
            id, campus, name, capacity, meetingTitles,
          }, index) => (
            <TableRow key={id} isStriped={index % 2 !== 0}>
              <TableCell>{campus}</TableCell>
              <TableRowHeadingCell scope="row">{name}</TableRowHeadingCell>
              <TableCell>{capacity}</TableCell>
              <TableCell>{meetingTitles.join(',\n')}</TableCell>
              <TableCell>
                <Button
                  onClick={() => { addButtonHandler(id, name); }}
                  variant={VARIANT.POSITIVE}
                >
                  Add

                </Button>
              </TableCell>
            </TableRow>
          ))}
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
