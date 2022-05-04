import { CellLayout } from 'client/components/general';
import { COURSE_TABLE_COLUMN, getAreaColor, TERM } from 'common/constants';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  TableBody, TableRow, TableRowHeadingCell, VALIGN, TableCell,
} from 'mark-one';
import React, { FunctionComponent, ReactElement } from 'react';
import { CourseInstanceListColumn } from './tableFields';

type OpenModalCallback = (
  course: CourseInstanceResponseDTO, term?: TERM) => void;

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
   * Controls the opening of the offered modal with the requested course and term
   */
  openOfferedModal: OpenModalCallback
  /**
   * Controls the opening of the notes modal
   */
  openNotesModal: OpenModalCallback
  /**
   * The ref value of the edit faculty absence button
   */
  setButtonRef: (nodeId: string) => (node: HTMLButtonElement) => void;
  /**
   * Indicates wether a user is an admin or not. This is used to enable or
   * disable editing of various fields in the table (and associated modals)
   */
  isAdmin: boolean;
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
  openOfferedModal,
  openNotesModal,
  setButtonRef,
  isAdmin,
}): ReactElement => (
  <TableBody>
    {courseList.map((course, index) => (
      <TableRow key={course.id} isStriped={index % 2 !== 0}>
        {tableData.map(
          (field: CourseInstanceListColumn): ReactElement => {
            const { FieldContent } = field;
            if (field.viewColumn === COURSE_TABLE_COLUMN.CATALOG_NUMBER) {
              return (
                <TableRowHeadingCell
                  scope="row"
                  key={field.key}
                  verticalAlignment={VALIGN.TOP}
                >
                  <CellLayout>
                    <FieldContent course={course} />
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
                    && getAreaColor(course.area)
                }
              >
                <CellLayout>
                  <FieldContent
                    course={course}
                    openMeetingModal={
                      field.viewColumn === COURSE_TABLE_COLUMN.MEETINGS
                        ? openMeetingModal
                        : null
                    }
                    openInstructorModal={
                      field.viewColumn === COURSE_TABLE_COLUMN.INSTRUCTORS
                        ? openInstructorModal
                        : null
                    }
                    openOfferedModal={
                      field.viewColumn === COURSE_TABLE_COLUMN.OFFERED
                        ? openOfferedModal
                        : null
                    }
                    openNotesModal={
                      field.viewColumn === COURSE_TABLE_COLUMN.NOTES
                        ? openNotesModal
                        : null
                    }
                    buttonRef={setButtonRef(`${field.key}-${course.id}`)}
                    isEditable={isAdmin}
                  />
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
