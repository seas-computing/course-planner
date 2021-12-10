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
  columns: ModalFieldsColumn[],

  checked: COURSE_TABLE_COLUMN[],

  /**
   * Handler to be invoked when a checkbox is checked or unchecked
  */
  onChange: (cols: COURSE_TABLE_COLUMN) => void;
}

/**
 * Component representing the list of CourseInstances in a given Academic year
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
        <>
          {
            [
              courseColumns,
              semesterColumns,
              metaColumns,
            ].map(({ length }) => (<colgroup span={length} />))
          }
        </>
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
                      onChange(viewColumn);
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
