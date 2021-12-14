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
  TableHeadingSpacer,
} from 'mark-one';
import {
  COURSE_TABLE_COLUMN,
  COURSE_TABLE_COLUMN_GROUP,
  isSEASEnumToString,
  IS_SEAS,
  OFFERED,
} from 'common/constants';
import { MetadataContext } from 'client/context';
import { offeredEnumToString } from 'common/constants/offered';
import { CourseInstanceListColumn } from './tableFields';
import { FilterState } from './filters.d';

interface CourseInstanceTableProps {
  /**
   * The list of courses to be shown in the table
   */
  courseList: ReactElement[];
  /**
   * The data to display
   */
  tableData: CourseInstanceListColumn[];
  /**
   * The Academic Year of the data currently being displayed
   */
  academicYear: number;
  /**
   * A handler to update the courses as the user changes the filters
   */
  genericFilterUpdate: (field: string, value: string) => void;
  /**
   * The current values of the table column filters
   */
  filters: FilterState;
}

/**
 * Component representing the list of CourseInstances in a given Academic year
 */
const CourseInstanceTable: FunctionComponent<CourseInstanceTableProps> = ({
  academicYear,
  courseList,
  tableData,
  genericFilterUpdate,
  filters,
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

  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

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
            {courseColumns.map(({ key, name, getFilter }): ReactElement => (
              <TableHeadingCell
                key={key}
                scope="col"
                rowSpan={getFilter ? '1' : '2'}
              >
                {name}
              </TableHeadingCell>
            ))}
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
                          .length}
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
                      rowSpan={field.getFilter ? '1' : '2'}
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
                rowSpan={2}
              >
                {name}
              </TableHeadingCell>
            ))}
          </>
        </TableRow>
        <TableRow>
          {tableData.map(
            (field: CourseInstanceListColumn): ReactElement => {
              const filterOptions = {
                area: metadata.areas.map((area) => ({
                  value: area,
                  label: area,
                })),
                isSEAS: Object.values(IS_SEAS)
                  .map((isSEASOption):
                  {value: string; label: string} => {
                    const isSEASDisplayTitle = isSEASEnumToString(
                      isSEASOption
                    );
                    return {
                      value: isSEASOption,
                      label: isSEASDisplayTitle,
                    };
                  }),
                offered: Object.values(OFFERED)
                  .map((offeredOption):
                  {value: string; label: string} => {
                    const offeredDisplayTitle = offeredEnumToString(
                      offeredOption
                    );
                    return {
                      value: offeredOption,
                      label: offeredDisplayTitle,
                    };
                  }),
              };
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
              return field.getFilter ? (
                <TableHeadingCell
                  scope="col"
                  key={field.key}
                >
                  {field.getFilter(
                    filters,
                    genericFilterUpdate,
                    filterOptions
                  )}
                </TableHeadingCell>
              ) : null;
            }
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {courseList}
      </TableBody>
    </Table>
  );
};

export default CourseInstanceTable;
