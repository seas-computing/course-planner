import React, {
  FunctionComponent,
  ReactElement,
  useContext,
} from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadingCell,
  TableCell,
  TableHeadingSpacer,
  TableRowHeadingCell,
  BaseTheme,
} from 'mark-one';

import { ThemeContext } from 'styled-components';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { COURSE_TABLE_COLUMN, COURSE_TABLE_COLUMN_GROUP } from 'common/constants';
import { CourseInstanceListColumn } from './tableFields';

interface CourseInstanceTableProps {
  /**
   * The list of courses to be shown in the table
   */
  courseList: CourseInstanceResponseDTO[];
  /**
   * The data to display
   */
  tableData: CourseInstanceListColumn[];
  /**
   * The Academic Year of the data currently being displayed
   */
  academicYear: number;
}
/**
 * Component representing the list of CourseInstances in a given Academic year
 */

const CourseInstanceTable: FunctionComponent<CourseInstanceTableProps> = ({
  academicYear,
  courseList,
  tableData,
}): ReactElement => {
  const courseColumns = tableData.filter(
    ({ columnGroup }): boolean => (
      columnGroup === COURSE_TABLE_COLUMN_GROUP.COURSE)
  );
  const fallColumns = tableData.filter(
    ({ columnGroup }): boolean => (
      columnGroup === COURSE_TABLE_COLUMN_GROUP.FALL)
  );
  const springColumns = tableData.filter(
    ({ columnGroup }): boolean => (
      columnGroup === COURSE_TABLE_COLUMN_GROUP.SPRING)
  );
  const metaColumns = tableData.filter(
    ({ columnGroup }): boolean => (
      columnGroup === COURSE_TABLE_COLUMN_GROUP.META)
  );
  const firstEnrollmentField = fallColumns
    .findIndex(({ viewColumn }): boolean => (
      viewColumn === COURSE_TABLE_COLUMN.ENROLLMENT
    ));

  const theme: BaseTheme = useContext(ThemeContext);

  return (
    <Table>
      <colgroup span={courseColumns.length} />
      {(fallColumns.length > 0 && <colgroup span={fallColumns.length} />)}
      {(springColumns.length > 0 && <colgroup span={springColumns.length} />)}
      <colgroup span={metaColumns.length} />
      <TableHead>
        {/*
          * Our top level of headers should only show the two semesters in the
          * current academic year, with all other headers blanked. If no
          * semester fields have been included, it will not render at all.
          */}
        {(fallColumns.length > 0 && springColumns.length > 0) && (
          <TableRow noHighlight>
            <>
              {courseColumns.map(({ key }): TableHeadingSpacer => (
                <TableHeadingSpacer key={key} />
              ))}
            </>
            <TableHeadingCell
              backgroundColor="transparent"
              colSpan={fallColumns.length}
              scope="colgroup"
            >
              {`Fall ${academicYear - 1}`}
            </TableHeadingCell>
            <TableHeadingCell
              backgroundColor="transparent"
              colSpan={fallColumns.length}
              scope="colgroup"
            >
              {`Spring ${academicYear}`}
            </TableHeadingCell>
            <>
              {metaColumns.map(({ key }): ReactElement => (
                <TableHeadingSpacer key={key} />
              ))}
            </>
          </TableRow>
        )}
        {/*
          * Our second layer of headers will includes all of the main column
          * headings. Because the individual enrollment values are nested under
          * "Enrollment", all non-enrollment headers will need to have
          * rowSpan="2" when the enrollment columns are visible.
          */}
        <TableRow>
          <>
            {courseColumns.map(({ key, name }): ReactElement => (
              <TableHeadingCell
                key={key}
                scope="col"
                rowSpan={firstEnrollmentField > -1 ? '2' : '1'}
              >
                {name}
              </TableHeadingCell>
            ))
            }
          </>
          <>
            {[fallColumns, springColumns].map(
              (dataList: CourseInstanceListColumn[]): ReactElement[] => dataList
                .map((
                  field: CourseInstanceListColumn,
                  index: number
                ): ReactElement => {
                  if (index === firstEnrollmentField) {
                    return (
                      <TableHeadingCell
                        key={field.key}
                        scope="auto"
                        colSpan={dataList
                          .filter(({ viewColumn }): boolean => (
                            viewColumn === COURSE_TABLE_COLUMN.ENROLLMENT))
                          .length
                        }
                      >
                        Enrollment
                      </TableHeadingCell>
                    );
                  }
                  if (field.viewColumn === COURSE_TABLE_COLUMN.ENROLLMENT) {
                    return null;
                  }
                  return (
                    <TableHeadingCell
                      key={field.key}
                      scope="col"
                      rowSpan={firstEnrollmentField > -1 ? 2 : 1}
                    >
                      {field.name}
                    </TableHeadingCell>
                  );
                })
            )}
          </>
          <>
            {metaColumns.map(({ key, name }): ReactElement => (
              <TableHeadingCell
                key={key}
                scope="col"
                rowSpan={firstEnrollmentField > -1 ? 2 : 1}
              >
                {name}
              </TableHeadingCell>
            ))
            }
          </>
        </TableRow>
        {/*
          * The third layers of headers will only include the sub-values for
          * Enrollment, so it will only be rendered if the "Enrollment" column
          * is visible.
          */}
        {firstEnrollmentField > -1 && (
          <TableRow>
            {tableData.map(
              (field: CourseInstanceListColumn): ReactElement => {
                if (field.viewColumn === COURSE_TABLE_COLUMN.ENROLLMENT) {
                  return (
                    <TableHeadingCell
                      scope="col"
                      key={field.key}
                    >
                      {field.name}
                    </TableHeadingCell>
                  );
                }
                return null;
              }

            )}
          </TableRow>
        )
        }
      </TableHead>
      <TableBody>
        {courseList.map(
          (
            course: CourseInstanceResponseDTO,
            index: number
          ): ReactElement => (
            <TableRow key={course.id} isStriped={index % 2 !== 0}>
              {tableData.map(
                (field: CourseInstanceListColumn): ReactElement => {
                  if (field.viewColumn === COURSE_TABLE_COLUMN.CATALOG_NUMBER) {
                    return (
                      <TableRowHeadingCell scope="row" key={field.key}>
                        {field.getValue(course)}
                      </TableRowHeadingCell>
                    );
                  }
                  return (
                    <TableCell
                      key={field.key}
                      backgroundColor={
                        field.viewColumn === COURSE_TABLE_COLUMN.AREA
                          ? theme.color.area[
                            String(field.getValue(course)).toLowerCase()
                          ]
                          : null}
                    >
                      {field.getValue(course)}
                    </TableCell>
                  );
                }
              )}
            </TableRow>
          )
        )
        }
      </TableBody>
    </Table>
  );
};

export default CourseInstanceTable;
