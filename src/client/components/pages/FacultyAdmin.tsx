import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  BaseTheme,
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
  BorderlessButton,
  VARIANT,
  ALIGN,
} from 'mark-one';
import { ThemeContext } from 'styled-components';
import {
  MESSAGE_TYPE,
  AppMessage,
  MESSAGE_ACTION,
} from 'client/classes';
import { MessageContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FacultyResponseDTO } from 'common/dto/faculty/facultyResponse.dto';
import { getAllFacultyMembers } from '../../api/faculty';

/**
 * The component represents the Faculty Admin page, which will be rendered at
 * route '/faculty-admin'
 */

const FacultyAdmin: FunctionComponent = function (): ReactElement {
  const [currentFacultyMembers, setFacultyMembers] = useState(
    [] as FacultyResponseDTO[]
  );

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Gets the faculty data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    getAllFacultyMembers()
      .then((facultyMembers): FacultyResponseDTO[] => {
        setFacultyMembers(facultyMembers);
        return facultyMembers;
      })
      .catch((): void => {
        dispatchMessage({
          message: new AppMessage(
            'Unable to get faculty data from server. If the problem persists, contact SEAS Computing',
            MESSAGE_TYPE.ERROR
          ),
          type: MESSAGE_ACTION.PUSH,
        });
      });
  }, []);

  const theme: BaseTheme = useContext(ThemeContext);

  return (
    <div className="faculty-admin-table">
      <Table>
        <TableHead>
          <TableRow isStriped>
            <TableHeadingCell scope="col">Area</TableHeadingCell>
            <TableHeadingCell scope="col">HUID</TableHeadingCell>
            <TableHeadingCell scope="col">Last Name</TableHeadingCell>
            <TableHeadingCell scope="col">First Name</TableHeadingCell>
            <TableHeadingCell scope="col">Edit</TableHeadingCell>
          </TableRow>
        </TableHead>
        <TableBody isScrollable>
          {currentFacultyMembers
            .map((faculty, i): ReactElement<TableRowProps> => (
              <TableRow isStriped={i % 2 === 1} key={faculty.id}>
                <TableCell
                  alignment={ALIGN.CENTER}
                  backgroundColor={
                    (faculty.area
                      && theme.color.area[faculty.area.name.toLowerCase()])
                      ? theme
                        .color
                        .area[faculty.area.name.toLowerCase()]
                      : undefined
                  }
                >
                  {faculty.area && faculty.area.name}
                </TableCell>
                <TableCell alignment={ALIGN.CENTER}>{faculty.HUID}</TableCell>
                <TableCell>{faculty.lastName}</TableCell>
                <TableCell>{faculty.firstName}</TableCell>
                <TableCell alignment={ALIGN.CENTER}>
                  <BorderlessButton
                    variant={VARIANT.INFO}
                    onClick={(): void => {}}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </BorderlessButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacultyAdmin;
