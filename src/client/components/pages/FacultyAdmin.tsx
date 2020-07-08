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
  Button,
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
import { MetadataContext } from 'client/context/MetadataContext';
import { POSITION } from 'mark-one/lib/Forms/Label';
import { FACULTY_TYPE } from 'common/constants';
import {
  sortFaculty,
} from 'common/__tests__/utils/facultyHelperFunctions';
import { getAreaColor } from '../../../common/constants';
import { FacultyAPI } from '../../api/faculty';
import FacultyModal from './FacultyModal';

/**
 * Computes the id of the faculty button for the faculty being edited
 */
const computeEditFacultyButtonId = (faculty: ManageFacultyResponseDTO):
string => `editFaculty${faculty.id}`;

/**
 * The component represents the Faculty Admin page, which will be rendered at
 * route '/faculty-admin'
 */

const FacultyAdmin: FunctionComponent = function (): ReactElement {
  /**
   * The current list of faculty members used to populate the Faculty Admin table
   */
  const [currentFacultyMembers, setFacultyMembers] = useState(
    [] as ManageFacultyResponseDTO[]
  );

  /**
   * Keeps track of whether the create faculty modal is currently visible.
   * By default, the modal is not visible.
   */
  const [
    createFacultyModalVisible,
    setCreateFacultyModalVisible,
  ] = useState(false);

  /**
   * Keeps track of whether the edit faculty modal is currently visible.
   * By default, the modal is not visible.
   */
  const [
    editFacultyModalVisible,
    setEditFacultyModalVisible,
  ] = useState(false);

  /**
   * The currently selected faculty
   */
  const [
    currentFaculty,
    setCurrentFaculty,
  ] = useState(null as ManageFacultyResponseDTO);

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Gets the faculty data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    FacultyAPI.getAllFacultyMembers()
      .then((facultyMembers): ManageFacultyResponseDTO[] => {
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

  /**
   * Provides the Mark-One theme using styled component's ThemeContext
   */
  const theme = useContext(ThemeContext);

  return (
    <>
      <div className="create-faculty-button">
        <Button
          id="createFaculty"
          onClick={
            (): void => { setCreateFacultyModalVisible(true); }
          }
          variant={VARIANT.INFO}
        >
          Create New Faculty
        </Button>
      </div>
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
                      id={computeEditFacultyButtonId(faculty)}
                      variant={VARIANT.INFO}
                      onClick={
                        (): void => {
                          setCurrentFaculty(faculty);
                          setEditFacultyModalVisible(true);
                        }
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </BorderlessButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <FacultyModal
          isVisible={createFacultyModalVisible}
          onClose={(): void => {
            setCreateFacultyModalVisible(false);
            document.getElementById('createFaculty').focus();
          }}
          onSuccess={(newFacultyEntry: ManageFacultyResponseDTO): void => {
            // Sort the new list of faculty
            setFacultyMembers(sortFaculty([
              ...currentFacultyMembers,
              newFacultyEntry,
            ]));
          }}
        />
        <FacultyModal
          isVisible={editFacultyModalVisible}
          currentFaculty={currentFaculty}
          onClose={(): void => {
            setEditFacultyModalVisible(false);
            const buttonId = computeEditFacultyButtonId(currentFaculty);
            document.getElementById(buttonId).focus();
          }}
          onSuccess={(editedFacultyMember: ManageFacultyResponseDTO): void => {
            setFacultyMembers(sortFaculty(
              currentFacultyMembers.map((faculty):
              ManageFacultyResponseDTO => (
                faculty.id === editedFacultyMember.id
                  ? editedFacultyMember
                  : faculty
              ))
            ));
          }}
        />
      </div>
    </>
  );
};

export default FacultyAdmin;
