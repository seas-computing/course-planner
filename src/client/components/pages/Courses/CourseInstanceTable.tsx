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
  VALIGN,
  Dropdown,
} from 'mark-one';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  COURSE_TABLE_COLUMN,
  COURSE_TABLE_COLUMN_GROUP,
  getAreaColor,
  isSEASEnumToString,
  IS_SEAS,
  OFFERED,
} from 'common/constants';
import { CellLayout } from 'client/components/general';
import { MetadataContext } from 'client/context';
import { offeredEnumToString } from 'common/constants/offered';
import { CourseInstanceListColumn } from './tableFields';
import { FilterState } from './CoursesPage';

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
  /**
  * A handler to merge an updated course back into the complete list
  */
  courseUpdateHandler: (course: CourseInstanceResponseDTO) => void;
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
  courseUpdateHandler,
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
            {courseColumns.map(({ key, name, viewColumn }): ReactElement => (
              <TableHeadingCell
                key={key}
                scope="col"
                rowSpan={firstEnrollmentField > -1 && (
                  viewColumn !== COURSE_TABLE_COLUMN.AREA
                  && viewColumn !== COURSE_TABLE_COLUMN.IS_SEAS
                ) ? '2' : '1'}
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
                      rowSpan={firstEnrollmentField > -1 && (
                        field.viewColumn !== COURSE_TABLE_COLUMN.OFFERED
                      ) ? '2' : '1'}
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
            ))}
          </>
        </TableRow>
        <TableRow>
          {tableData.map(
            (field: CourseInstanceListColumn): ReactElement => {
              if (field.viewColumn === COURSE_TABLE_COLUMN.AREA) {
                return (
                  <TableHeadingCell
                    scope="col"
                    key={field.key}
                  >
                    <Dropdown
                      options={
                        [{ value: 'All', label: 'All' }]
                          .concat(metadata.areas.map((area) => ({
                            value: area,
                            label: area,
                          })))
                      }
                      value={filters.area}
                      name="areaValue"
                      id="areaValue"
                      label="The table will be filtered as selected in this area dropdown filter"
                      isLabelVisible={false}
                      hideError
                      onChange={(evt) => { genericFilterUpdate('area', (evt.target as HTMLSelectElement).value); }}
                    />
                  </TableHeadingCell>
                );
              }
              if (field.viewColumn === COURSE_TABLE_COLUMN.IS_SEAS) {
                return (
                  <TableHeadingCell
                    scope="col"
                    key={field.key}
                  >
                    <Dropdown
                      options={
                        [{ value: 'All', label: 'All' }]
                          .concat(Object.values(IS_SEAS)
                            .map((isSEASOption):
                            {value: string; label: string} => {
                              const isSEASDisplayTitle = isSEASEnumToString(
                                isSEASOption
                              );
                              return {
                                value: isSEASOption,
                                label: isSEASDisplayTitle,
                              };
                            }))
                      }
                      value={filters.isSEAS}
                      name="isSEASValue"
                      id="isSEASValue"
                      label="The table will be filtered as selected in this Is SEAS dropdown filter"
                      isLabelVisible={false}
                      hideError
                      onChange={(evt) => { genericFilterUpdate('isSEAS', (evt.target as HTMLSelectElement).value); }}
                    />
                  </TableHeadingCell>
                );
              }
              const isFall = field.columnGroup
                  === COURSE_TABLE_COLUMN_GROUP.FALL;
              if (field.viewColumn === COURSE_TABLE_COLUMN.OFFERED) {
                return (
                  <TableHeadingCell
                    scope="col"
                    key={field.key}
                  >
                    <Dropdown
                      options={
                        [{ value: 'All', label: 'All' }]
                          .concat(Object.values(OFFERED)
                            .map((offeredOption):
                            {value: string; label: string} => {
                              const offeredDisplayTitle = offeredEnumToString(
                                offeredOption
                              );
                              return {
                                value: offeredOption,
                                label: offeredDisplayTitle,
                              };
                            }))
                      }
                      value={isFall
                        ? filters.fall.offered
                        : filters.spring.offered}
                      name={isFall ? 'fallOfferedValue' : 'springOfferedValue'}
                      id={isFall ? 'fallOfferedValue' : 'springOfferedValue'}
                      label={isFall
                        ? 'The table will be filtered as selected in this fall offered dropdown filter'
                        : 'The table will be filtered as selected in this spring offered dropdown filter'}
                      isLabelVisible={false}
                      hideError
                      onChange={(evt) => {
                        if (isFall) {
                          genericFilterUpdate('fall.offered', (evt.target as HTMLSelectElement).value);
                        } else {
                          genericFilterUpdate('spring.offered', (evt.target as HTMLSelectElement).value);
                        }
                      }}
                    />
                  </TableHeadingCell>
                );
              }
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
      </TableHead>
      <TableBody>
        {courseList.map(
          (
            course: CourseInstanceResponseDTO,
            index: number
          ): { course: CourseInstanceResponseDTO; element: ReactElement } => (
            {
              course,
              element: (
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
                                updateHandler: courseUpdateHandler,
                              }
                            )}
                          </CellLayout>
                        </TableCell>
                      );
                    }
                  )}
                </TableRow>
              ),
            })
        )
          .map(({ element }) => element)}
      </TableBody>
    </Table>
  );
};

export default CourseInstanceTable;
