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
import { COURSE_TABLE_COLUMN, MANDATORY_COLUMNS } from 'common/constants';
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
}): ReactElement => (
  <Form label="Customize View">
    <Table>
      <TableHead>
        <TableRow noHighlight>
          <TableHeadingSpacer colSpan={5} />
          <TableHeadingCell colSpan="5">Semester</TableHeadingCell>
          <TableHeadingSpacer />
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

export default SemesterTable;
