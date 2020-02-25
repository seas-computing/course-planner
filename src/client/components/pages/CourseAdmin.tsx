import React, {
  FunctionComponent, ReactElement,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
} from 'mark-one';

/**
 * The component represents the Course Admin page, which will be rendered at
 * route '/course-admin'
 */
const CourseAdmin: FunctionComponent = (): ReactElement => (
  <div>
    <Table>
      <TableHead>
        <TableRow isStriped>
          <TableHeadingCell scope="col">Course Prefix</TableHeadingCell>
          <TableHeadingCell scope="col">Course</TableHeadingCell>
          <TableHeadingCell scope="col">Title</TableHeadingCell>
          <TableHeadingCell scope="col">Edit</TableHeadingCell>
        </TableRow>
      </TableHead>
      <TableBody isScrollable>
        <TableRow>
          <TableCell>ACS</TableCell>
          <TableCell>AC207</TableCell>
          <TableCell>Computational Foundations of Data Science</TableCell>
          <TableCell>Edit</TableCell>
        </TableRow>
        <TableRow isStriped>
          <TableCell>ACS</TableCell>
          <TableCell>AC209</TableCell>
          <TableCell>Data Science</TableCell>
          <TableCell>Edit</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ACS</TableCell>
          <TableCell>AC209a</TableCell>
          <TableCell>Data Science 1: Intro to Data Science</TableCell>
          <TableCell>Edit</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export default CourseAdmin;
