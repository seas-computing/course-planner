import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadingCell,
  TableCell,
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { tableFields, CourseInstanceListColumn } from './tableFields';

interface CourseInstanceTableProps {
  /**
   * The list of courses to be shown in the table
   */
  courseList: CourseInstanceResponseDTO[];
  /**
   * The user-defined list of columns to show
   */
  columns: string[];
}
/**
 * Component representing the list of CourseInstances in a given Academic year
 */

const CourseInstanceTable: FunctionComponent<CourseInstanceTableProps> = ({
  courseList,
  columns,
}): ReactElement => (
  <Table>
    <TableHead>
      <TableRow isStriped>
        {tableFields.map(
          (field: CourseInstanceListColumn): ReactElement => (
            columns.includes(field.viewColumn)
              && (
                <TableHeadingCell
                  key={field.key}
                  scope="col"
                >
                  {field.name}
                </TableHeadingCell>
              )
          )
        )}
        <TableHeadingCell scope="col">Details</TableHeadingCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {courseList.map(
        (
          course: CourseInstanceResponseDTO,
          index: number
        ): ReactElement => (
          <TableRow key={course.id} isStriped={index % 2 !== 0}>
            {tableFields.map(
              (field: CourseInstanceListColumn): ReactElement => (
                columns.includes(field.viewColumn)
                    && field.viewColumn !== 'notes'
                    && (
                      <TableCell
                        key={field.key}
                      >
                        {field.getValue(course)}
                      </TableCell>
                    )
              )
            )}
            {columns.includes('notes') && (
              <TableCell>
                <BorderlessButton
                  variant={VARIANT.INFO}
                  onClick={(): void => { }}
                >
                  <FontAwesomeIcon icon={faStickyNote} />
                </BorderlessButton>
              </TableCell>
            )}
            <TableCell>
              <BorderlessButton
                variant={VARIANT.INFO}
                onClick={(): void => { }}
              >
                <FontAwesomeIcon icon={faFolderOpen} />
              </BorderlessButton>
            </TableCell>
          </TableRow>
        )
      )
      }
    </TableBody>
  </Table>
);

export default CourseInstanceTable;
