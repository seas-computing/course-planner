import { CellLayout } from 'client/components/general';
import { COURSE_TABLE_COLUMN, getAreaColor, TERM } from 'common/constants';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  TableBody, TableRow, TableRowHeadingCell, VALIGN, TableCell,
} from 'mark-one';
import React, { FunctionComponent, ReactElement, Ref } from 'react';
import { CourseInstanceListColumn } from './tableFields';

type OpenModalCallback = (
  course: CourseInstanceResponseDTO, term: TERM) => void;

interface CourseInstanceTableBodyProps {
  /**
   * The list of courses to be shown in the table
   */
  courseList: CourseInstanceResponseDTO[];
  /**
   * The data to display
   */
  tableData: CourseInstanceListColumn[];
  /**
   * Controls the opening of the meeting modal with the requested course and term
   */
  openMeetingModal: OpenModalCallback
  /**
   * Controls the opening of the instructor modal with the requested course and term
   */
  openInstructorModal: OpenModalCallback
  /**
   * The ref value of the edit faculty absence button
   */
  buttonRef: Ref<HTMLButtonElement>;
  /**
   * The id of the edit button corresponding to the opened modal
   */
  modalButtonId: string;
}

/**
 * The Course Instance table body has been separated from the rest of the table in
 * order to prevent the table body contents from re-rendering when the user
 * interacts with the table header via filtering.
 */
const CourseInstanceTableBody:
FunctionComponent<CourseInstanceTableBodyProps> = ({
  courseList,
  tableData,
  openMeetingModal,
  openInstructorModal,
  buttonRef,
  modalButtonId,
}): ReactElement => (
  <TableBody>
    {courseList.map((course, index) => (
      <TableRow key={course.id} isStriped={index % 2 !== 0}>
        {tableData.map(
          (field: CourseInstanceListColumn): ReactElement => {
            if (field.viewColumn
                  === COURSE_TABLE_COLUMN.CATALOG_NUMBER) {
              return (
                <TableRowHeadingCell
                  scope="row"
                  key={field.key}
                  verticalAlignment={VALIGN.TOP}
                >
                  <CellLayout>
                    {field.getValue(course)}
                  </CellLayout>
                </TableRowHeadingCell>
              );
            }
            return (
              <TableCell
                verticalAlignment={VALIGN.TOP}
                key={field.key}
                backgroundColor={
                  field.viewColumn === COURSE_TABLE_COLUMN.AREA
                      && getAreaColor(field.getValue(course) as string)
                }
              >
                <CellLayout>
                  {field.getValue(
                    course,
                    {
                      openMeetingModal,
                      openInstructorModal,
                      buttonRef,
                      modalButtonId,
                    }
                  )}
                </CellLayout>
              </TableCell>
            );
          }
        )}
      </TableRow>
    ))}
  </TableBody>
);

export default CourseInstanceTableBody;
