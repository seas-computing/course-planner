import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
  BorderlessButton,
  VARIANT,
  ALIGN,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'mark-one';
import {
  MESSAGE_TYPE,
  AppMessage,
  MESSAGE_ACTION,
} from 'client/classes';
import { MessageContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { getAllFacultyMembers } from '../../api/faculty';
import { getAreaColor } from '../../../common/constants';

/**
 * The component represents the Faculty Admin page, which will be rendered at
 * route '/faculty-admin'
 */

const FacultyAdmin: FunctionComponent = function (): ReactElement {
  const [currentFacultyMembers, setFacultyMembers] = useState(
    [] as ManageFacultyResponseDTO[]
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
      .then((facultyMembers) => {
        setFacultyMembers(facultyMembers);
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
  }, [dispatchMessage]);

  /**
   * Keeps track of whether the modal is currently visible.
   * By default, the modal is not visible.
   */
  const [modalVisible, setModalVisible] = useState(false);
  /**
   * Provides the Mark-One theme using styled component's ThemeContext
   */
  const theme = useContext(ThemeContext);

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
            .map((faculty, facultyIndex): ReactElement<TableRowProps> => (
              <TableRow isStriped={facultyIndex % 2 === 1} key={faculty.id}>
                <TableCell
                  alignment={ALIGN.CENTER}
                  backgroundColor={getAreaColor(faculty.area.name)}
                >
                  {faculty.area && faculty.area.name}
                </TableCell>
                <TableCell alignment={ALIGN.CENTER}>{faculty.HUID}</TableCell>
                <TableCell>{faculty.lastName}</TableCell>
                <TableCell>{faculty.firstName}</TableCell>
                <TableCell alignment={ALIGN.CENTER}>
                  <BorderlessButton
                    variant={VARIANT.INFO}
                    onClick={(): void => { setModalVisible(true); }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </BorderlessButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <Modal
        closeHandler={(): void => { setModalVisible(false); }}
        isVisible={modalVisible}
      >
        <ModalHeader>Edit Faculty</ModalHeader>
        <ModalBody>Modal Body</ModalBody>
      </Modal>
    </div>
  );
};

export default FacultyAdmin;
