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
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
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
      <colgroup span={fallData.length} />
      <colgroup span={springData.length} />
      <colgroup span={metaData.length} />
      <TableHead>
        {fallData.length > 0 && springData.length > 0 && (
          <tr>
            {courseData.map(({ key }): ReactElement => (
              <th key={key} style={{ opacity: 0 }} />
            ))}
            <th
              colSpan={fallData.length}
              scope="colgroup"
            >
              <BorderlessButton
                variant={VARIANT.POSITIVE}
                onClick={(): void => {}}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </BorderlessButton>
              {`Fall ${academicYear - 1}`}
            </th>
            <th
              colSpan={fallData.length}
              scope="colgroup"
            >
              {`Spring ${academicYear}`}
              <BorderlessButton
                variant={VARIANT.POSITIVE}
                onClick={(): void => {}}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </BorderlessButton>
            </th>
            {metaData.map(({ key }): ReactElement => (
              <th key={key} style={{ opacity: 0 }} />
            ))}
          </tr>
        )}
        <TableRow>
          {courseData.map(({ key, name }): ReactElement => (
            <TableHeadingCell
              key={key}
              scope="col"
              rowSpan="2"
            >
              {name}
            </TableHeadingCell>
          ))
          }
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
                      scope="colgroup"
                      colSpan="3"
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
                    rowSpan="2"
                  >
                    {field.name}
                  </TableHeadingCell>
                );
              })
          )}
          {metaData.map(({ key, name }): ReactElement => (
            <TableHeadingCell
              key={key}
              scope="col"
              rowSpan="2"
            >
              {name}
            </TableHeadingCell>
          ))
          }
        </TableRow>
        <TableRow>
          {tableData.map(
            (field: CourseInstanceListColumn): ReactElement => {
              if (field.viewColumn === 'enrollment') {
                return (
                  <TableHeadingCell
                    scope="colgroup"
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
      </TableHead>
      <TableBody>
        {courseList.map(
          (
            course: CourseInstanceResponseDTO,
            index: number
          ): ReactElement => (
            <TableRow key={course.id} isStriped={index % 2 !== 0}>
              {tableData.map(
                (field: CourseInstanceListColumn): ReactElement => (
                  <TableCell
                    key={field.key}
                  >
                    {field.getValue(course)}
                  </TableCell>
                )
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
