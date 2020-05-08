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
  TableHeadingSpacer,
  TableRowHeadingCell,
  BaseTheme,
} from 'mark-one';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseInstanceListColumn, COLUMN_GROUP } from './tableFields';

interface CourseInstanceTableProps {
  /**
   * The list of courses to be shown in the table
   */
  courseList: CourseInstanceResponseDTO[];
  /**
   * The data to display to show
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
  const courseData = tableData.filter(
    ({ columnGroup }): boolean => columnGroup === COLUMN_GROUP.COURSE
  );
  const fallData = tableData.filter(
    ({ columnGroup }): boolean => columnGroup === COLUMN_GROUP.FALL
  );
  const springData = tableData.filter(
    ({ columnGroup }): boolean => columnGroup === COLUMN_GROUP.SPRING
  );
  const metaData = tableData.filter(
    ({ columnGroup }): boolean => columnGroup === COLUMN_GROUP.META
  );
  const firstEnrollmentField = fallData
    .findIndex(({ viewColumn }): boolean => (
      viewColumn === 'enrollment'
    ));
  return (
    <Table>
      <colgroup span={courseData.length} />
      {(fallData.length > 0 && <colgroup span={fallData.length} />)}
      {(springData.length > 0 && <colgroup span={springData.length} />)}
      <colgroup span={metaData.length} />
      <TableHead>
        {(fallData.length > 0 && springData.length > 0) && (
          <TableRow noHighlight>
            <>
              {courseData.map(({ key }): TableHeadingSpacer => (
                <TableHeadingSpacer key={key} />
              ))}
            </>
            <TableHeadingCell
              backgroundColor="transparent"
              colSpan={fallData.length}
              scope="colgroup"
            >
              {`Fall ${academicYear - 1}`}
            </TableHeadingCell>
            <TableHeadingCell
              backgroundColor="transparent"
              colSpan={fallData.length}
              scope="colgroup"
            >
              {`Spring ${academicYear}`}
            </TableHeadingCell>
            <>
              {metaData.map(({ key }): ReactElement => (
                <TableHeadingSpacer key={key} />
              ))}
            </>
          </TableRow>
        )}
        <TableRow>
          <>
            {courseData.map(({ key, name }): ReactElement => (
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
            {[fallData, springData].map(
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
                          .filter(({ viewColumn }): boolean => viewColumn === 'enrollment')
                          .length
                        }
                      >
                        Enrollment
                      </TableHeadingCell>
                    );
                  }
                  if (field.viewColumn === 'enrollment') {
                    return null;
                  }
                  return (
                    <TableHeadingCell
                      key={field.key}
                      scope="col"
                      rowSpan={firstEnrollmentField > -1 ? '2' : null}
                    >
                      {field.name}
                    </TableHeadingCell>
                  );
                })
            )}
          </>
          <>
            {metaData.map(({ key, name }): ReactElement => (
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
        </TableRow>
        {firstEnrollmentField > -1 && (
          <TableRow>
            {tableData.map(
              (field: CourseInstanceListColumn): ReactElement => {
                if (field.viewColumn === 'enrollment') {
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
                  if (field.viewColumn === 'catalogNumber') {
                    return (
                      <TableHeadingCell scope="row" key={field.key}>
                        {field.getValue(course)}
                      </TableHeadingCell>
                    );
                  }
                  return (
                    <TableCell
                      key={field.key}
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
