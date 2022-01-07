import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableCell,
  TableHeadingSpacer,
  Checkbox,
  TableBody,
  Form,
} from 'mark-one';
import { COURSE_TABLE_COLUMN, COURSE_TABLE_COLUMN_GROUP, MANDATORY_COLUMNS } from 'common/constants';
import { ModalFieldsColumn } from './modalFields';

interface SemesterTableProps {
  /**
   * List of columns that should be displayed for show/hide
   */
  columns: ModalFieldsColumn[],

  /**
   * Of the columns above, the unique column reference to columns that should
   * be considered visible (or the checkbox checked). Columns present in
   * `columns`, but not here will be displayed unchecked.
   */
  checked: COURSE_TABLE_COLUMN[],

  /**
   * Handler to be invoked when a checkbox is checked or unchecked
  */
  onChange: (cols: COURSE_TABLE_COLUMN) => void;
}

/**
 * Component to show/hide columns in the CourseInstance table
 */
const SemesterTable: FunctionComponent<SemesterTableProps> = ({
  columns,
  checked,
  onChange,
}): ReactElement => {
  const courseColumns = columns.filter(
    ({ columnGroup }) => columnGroup === COURSE_TABLE_COLUMN_GROUP.COURSE
  );
  const semesterColumns = columns.filter(
    ({ columnGroup }) => columnGroup === COURSE_TABLE_COLUMN_GROUP.SEMESTER
  );
  const metaColumns = columns.filter(
    ({ columnGroup }) => columnGroup === COURSE_TABLE_COLUMN_GROUP.META
  );
  return (
    <Form label="Customize View">
      <Table>
        <colgroup span={courseColumns.length} />
        <colgroup span={semesterColumns.length} />
        <colgroup span={metaColumns.length} />
        <TableHead>
          <TableRow noHighlight>
            <TableHeadingSpacer colSpan={courseColumns.length} />
            <TableHeadingCell colSpan={semesterColumns.length}>
              Semester
            </TableHeadingCell>
            <TableHeadingSpacer colSpan={metaColumns.length} />
          </TableRow>
          <TableRow>
            {
              columns.map(({ name, key }) => (
                <TableHeadingCell key={key}>{ name }</TableHeadingCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow noHighlight>
            {
              columns.map(({ name, viewColumn, key }) => (
                <TableCell key={key}>
                  <Checkbox
                    isLabelVisible={false}
                    disabled={MANDATORY_COLUMNS.includes(viewColumn)}
                    checked={
                      checked.concat(MANDATORY_COLUMNS).includes(viewColumn)
                    }
                    onChange={() => {
                      if (!MANDATORY_COLUMNS.includes(viewColumn)) {
                        onChange(viewColumn);
                      }
                    }}
                    label={name}
                  />
                </TableCell>
              ))
            }
          </TableRow>
        </TableBody>
      </Table>
    </Form>
  );
};

export default SemesterTable;
