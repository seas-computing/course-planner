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
  Button,
  Dropdown,
  TextInput,
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
import { getAllFacultyMembers } from '../../api/faculty';
import { getAreaColor } from '../../../common/constants';
import { categoryEnumToTitleCase } from './Faculty/FacultyScheduleTable';

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
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

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
   * Keeps track of the currently selected value of the Create Faculty
   * area dropdown.
   * By default, the initially selected area will be the first area in the
   * metadata area list.
   */
  const [
    createFacultyArea,
    setCreateFacultyArea,
  ] = useState('');

  /**
   * Keeps track of the current value of the HUID text field in the
   * Create Faculty modal
   */
  const [
    createFacultyHUID,
    setCreateFacultyHUID,
  ] = useState('');

  /**
   * Keeps tracks of the current value of the first name field in the
   * Create Faculty modal
   */
  const [
    createFacultyFirstName,
    setCreateFacultyFirstName,
  ] = useState('');

  /**
   * Keeps tracks of the current value of the last name field in the
   * Create Faculty modal
   */
  const [
    createFacultyLastName,
    setCreateFacultyLastName,
  ] = useState('');

  /**
   * Keeps tracks of the current value of the joint with field in the
   * Create Faculty modal
   */
  const [
    createFacultyJointWith,
    setCreateFacultyJointWith,
  ] = useState('');

  /**
   * Keeps tracks of the current value of the faculty category dropdown in the
   * Create Faculty modal
   */
  const [
    createFacultyCategory,
    setCreateFacultyCategory,
  ] = useState('');

  /**
   * Provides the Mark-One theme using styled component's ThemeContext
   */
  const theme = useContext(ThemeContext);

  return (
    <>
      <div className="create-faculty-button">
        <Button
          onClick={
            (): void => { setCreateFacultyModalVisible(true); }
          }
          variant={VARIANT.PRIMARY}
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
                      variant={VARIANT.INFO}
                      onClick={
                        (): void => { setEditFacultyModalVisible(true); }
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </BorderlessButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Modal
          closeHandler={(): void => {
            setCreateFacultyModalVisible(false);
          }}
          onClose={(): void => {
            setCreateFacultyArea('');
            setCreateFacultyHUID('');
            setCreateFacultyFirstName('');
            setCreateFacultyLastName('');
            setCreateFacultyJointWith('');
            setCreateFacultyCategory('');
          }}
          isVisible={createFacultyModalVisible}
        >
          <ModalHeader>Create New Faculty</ModalHeader>
          <ModalBody>
            <label htmlFor="courseArea">
              Area
              <Dropdown
                id="courseArea"
                name="courseArea"
                /**
               * Insert an empty option so that no area is pre-selected in dropdown
               */
                options={[{ value: '', label: '' }].concat(metadata.areas.map((area):
                {value: string; label: string} => ({
                  value: area,
                  label: area,
                })))}
                onChange={(event): void => setCreateFacultyArea(
                  (event.target as HTMLSelectElement).value
                )}
                value={createFacultyArea}
              />
            </label>
            <TextInput
              id="HUID"
              name="HUID"
              label="HUID"
              labelPosition={POSITION.TOP}
              placeholder="e.g. 12345678"
              onChange={(event): void => setCreateFacultyHUID(
                (event.target as HTMLInputElement).value
              )}
              value={createFacultyHUID}
            />
            <TextInput
              id="firstName"
              name="firstName"
              label="First name"
              labelPosition={POSITION.TOP}
              placeholder="e.g. Jane"
              onChange={(event): void => setCreateFacultyFirstName(
                (event.target as HTMLInputElement).value
              )}
              value={createFacultyFirstName}
            />
            <TextInput
              id="lastName"
              name="lastName"
              label="Last name"
              labelPosition={POSITION.TOP}
              placeholder="e.g. Smith"
              onChange={(event): void => setCreateFacultyLastName(
                (event.target as HTMLInputElement).value
              )}
              value={createFacultyLastName}
            />
            <TextInput
              id="jointWith"
              name="jointWith"
              label="Joint with..."
              labelPosition={POSITION.TOP}
              placeholder="Add 'Joint With' entry"
              onChange={(event): void => setCreateFacultyJointWith(
                (event.target as HTMLInputElement).value
              )}
              value={createFacultyJointWith}
            />
            <label htmlFor="facultyCategory">
              Category
              <Dropdown
                id="facultyCategory"
                name="facultyCategory"
                /**
               * Insert an empty option so that no category is pre-selected in dropdown
               */
                options={[{ value: '', label: '' }]
                  .concat(Object.values(FACULTY_TYPE)
                    .map((category):
                    {value: string; label: string} => ({
                      value: categoryEnumToTitleCase(category),
                      label: categoryEnumToTitleCase(category),
                    })))}
                onChange={(event): void => setCreateFacultyCategory(
                  (event.target as HTMLSelectElement).value
                )}
                value={createFacultyCategory}
              />
            </label>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={(): void => setCreateFacultyModalVisible(false)}
              variant={VARIANT.PRIMARY}
            >
              Submit
            </Button>
            <Button
              onClick={(): void => setCreateFacultyModalVisible(false)}
              variant={VARIANT.SECONDARY}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
        <Modal
          closeHandler={(): void => { setEditFacultyModalVisible(false); }}
          isVisible={editFacultyModalVisible}
        >
          <ModalHeader>Edit Faculty</ModalHeader>
          <ModalBody>Modal Body</ModalBody>
        </Modal>
      </div>
    </>
  );
};

export default FacultyAdmin;
