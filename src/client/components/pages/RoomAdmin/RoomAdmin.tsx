import {
  Table,
  TableHead,
  TableHeadingCell,
  TableRow,
} from 'mark-one';
import React, { FunctionComponent } from 'react';

const RoomAdmin: FunctionComponent = () => (
  <div className="room-admin-table">
    <Table>
      <TableHead>
        <TableRow isStriped>
          <TableHeadingCell scope="col">Campus</TableHeadingCell>
          <TableHeadingCell scope="col">Building</TableHeadingCell>
          <TableHeadingCell scope="col">Room Name</TableHeadingCell>
        </TableRow>
      </TableHead>
    </Table>
  </div>
);

export default RoomAdmin;
