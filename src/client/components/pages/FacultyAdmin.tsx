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
  ValidationErrorMessage,
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
  validHUID,
  categoryEnumToTitleCase,
  sortFaculty,
} from 'common/__tests__/utils/facultyHelperFunctions';
import { getAreaColor } from '../../../common/constants';
import { FacultyAPI } from '../../api/faculty';

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
   * The current value of the area dropdown in the Create Faculty Modal.
   * By default, the initially selected area will be the first area in the
   * metadata area list.
   */
  const [
    createFacultyArea,
    setCreateFacultyArea,
  ] = useState('');

  /**
   * The current value of the HUID text field in the Create Faculty modal
   */
  const [
    createFacultyHUID,
    setCreateFacultyHUID,
  ] = useState('');

  /**
   * The current value of the first name field in the Create Faculty modal
   */
  const [
    createFacultyFirstName,
    setCreateFacultyFirstName,
  ] = useState('');

  /**
   * The current value of the last name field in the Create Faculty modal
   */
  const [
    createFacultyLastName,
    setCreateFacultyLastName,
  ] = useState('');

  /**
   * The current value of the faculty category dropdown in the
   * Create Faculty modal
   */
  const [
    createFacultyCategory,
    setCreateFacultyCategory,
  ] = useState('');

  /**
   * The current value of the joint with field in the Create Faculty modal
   */
  const [
    createFacultyJointWith,
    setCreateFacultyJointWith,
  ] = useState('');

  /**
   * The current value of the error message within the Create Faculty modal
   */
  const [
    createFacultyErrorMessage,
    setCreateFacultyErrorMessage,
  ] = useState('');

  /**
   * The currently selected faculty
   */
  const [
    currentFaculty,
    setCurrentFaculty,
  ] = useState(null as ManageFacultyResponseDTO);

  /**
   * The currently selected value of the area dropdown in the Edit Faculty Modal
   */
  const [
    editFacultyArea,
    setEditFacultyArea,
  ] = useState('');

  /**
   * The current value of the HUID text field in the Edit Faculty modal
   */
  const [
    editFacultyHUID,
    setEditFacultyHUID,
  ] = useState('');

  /**
   * The current value of the first name field in the Edit Faculty modal
   */
  const [
    editFacultyFirstName,
    setEditFacultyFirstName,
  ] = useState('');

  /**
   * The current value of the last name field in the Edit Faculty modal
   */
  const [
    editFacultyLastName,
    setEditFacultyLastName,
  ] = useState('');

  /**
   * The current value of the faculty category dropdown in the
   * Edit Faculty modal
   */
  const [
    editFacultyCategory,
    setEditFacultyCategory,
  ] = useState('');

  /**
   * The current value of the joint with field in the Edit Faculty modal
   */
  const [
    editFacultyJointWith,
    setEditFacultyJointWith,
  ] = useState('');

  /**
   * The current value of the error message within the Edit Faculty modal
   */
  const [
    editFacultyErrorMessage,
    setEditFacultyErrorMessage,
  ] = useState('');

  /**
   * Provides the Mark-One theme using styled component's ThemeContext
   */
  const theme = useContext(ThemeContext);

  /**
   * Submits the create faculty form, checking for valid inputs
   */
  const submitCreateFacultyForm = async ():
  Promise<ManageFacultyResponseDTO> => {
    const form = document.getElementById('createFacultyForm') as HTMLFormElement;
    // Since we are not using a submit button within the form
    // to submit, we must check the validity ourselves.
    // Here, if the form does not pass HTML validation,
    // we show the validation errors to the user and return without submitting.
    if (!form.reportValidity()) {
      throw new Error('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }
    if (!validHUID(createFacultyHUID)) {
      throw new Error('An HUID must contain 8 digits. Please try again.');
    }
    return FacultyAPI.createFaculty({
      area: createFacultyArea,
      HUID: createFacultyHUID,
      firstName: createFacultyFirstName,
      lastName: createFacultyLastName,
      jointWith: createFacultyJointWith,
      category: createFacultyCategory.replace(/\W/g, '_').toUpperCase() as FACULTY_TYPE,
    });
  };

  /**
   * Submits the edit faculty form, checking for valid inputs
   */
  const submitEditFacultyForm = async ():
  Promise<ManageFacultyResponseDTO> => {
    const form = document.getElementById('editFacultyForm') as HTMLFormElement;
    // Since we are not using a submit button within the form
    // to submit, we must check the validity ourselves.
    // Here, if the form does not pass HTML validation,
    // we show the validation errors to the user and return without submitting.
    if (!form.reportValidity()) {
      throw new Error('Please fill in the required fields and try again.');
    }
    if (!validHUID(editFacultyHUID)) {
      throw new Error('An HUID must contain 8 digits. Please try again.');
    }
    return FacultyAPI.editFaculty({
      id: currentFaculty.id,
      area: editFacultyArea,
      HUID: editFacultyHUID,
      firstName: editFacultyFirstName,
      lastName: editFacultyLastName,
      jointWith: editFacultyJointWith,
      category: editFacultyCategory.replace(/\W/g, '_').toUpperCase() as FACULTY_TYPE,
    });
  };

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
                      id={`editFaculty${faculty.id}`}
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
        <Modal
          ariaLabelledBy="createFaculty"
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
            setCreateFacultyErrorMessage('');
          }}
          isVisible={createFacultyModalVisible}
        >
          <ModalHeader>Create New Faculty</ModalHeader>
          <ModalBody>
            <form id="createFacultyForm">
              <label htmlFor="createFacultyCourseArea">
                Area
                <Dropdown
                  id="createFacultyCourseArea"
                  name="createFacultyCourseArea"
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
                  required
                />
              </label>
              <TextInput
                id="createFacultyHUID"
                name="createFacultyHUID"
                label="HUID"
                labelPosition={POSITION.TOP}
                placeholder="e.g. 12345678"
                onChange={(event): void => setCreateFacultyHUID(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={createFacultyHUID}
                required
              />
              <TextInput
                id="createFacultyFirstName"
                name="createFacultyFirstName"
                label="First name"
                labelPosition={POSITION.TOP}
                placeholder="e.g. Jane"
                onChange={(event): void => setCreateFacultyFirstName(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={createFacultyFirstName}
              />
              <TextInput
                id="createFacultyLastName"
                name="createFacultyLastName"
                label="Last name"
                labelPosition={POSITION.TOP}
                placeholder="e.g. Smith"
                onChange={(event): void => setCreateFacultyLastName(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={createFacultyLastName}
                required
              />
              <label htmlFor="createFacultyCategory">
                Category
                <Dropdown
                  id="createFacultyCategory"
                  name="createFacultyCategory"
                  /**
                   * Insert an empty option so that no category is pre-selected in dropdown
                   */
                  options={[{ value: '', label: '' }]
                    .concat(Object.values(FACULTY_TYPE)
                      .map((category):
                      {value: string; label: string} => {
                        const categoryTitle = categoryEnumToTitleCase(category);
                        return {
                          value: category,
                          label: categoryTitle,
                        };
                      }))}
                  onChange={(event): void => setCreateFacultyCategory(
                    (event.target as HTMLSelectElement).value
                  )}
                  value={createFacultyCategory}
                  required
                />
              </label>
              <TextInput
                id="createFacultyJointWith"
                name="createFacultyJointWith"
                label="Joint with..."
                labelPosition={POSITION.TOP}
                placeholder="Add 'Joint With' entry"
                onChange={(event): void => setCreateFacultyJointWith(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={createFacultyJointWith}
              />
              <ValidationErrorMessage>
                {createFacultyErrorMessage}
              </ValidationErrorMessage>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              id="createFacultySubmit"
              onClick={async (): Promise<void> => {
                try {
                  const newFacultyEntry = await submitCreateFacultyForm();
                  // Sort the new list of faculty
                  setFacultyMembers(sortFaculty([
                    ...currentFacultyMembers,
                    newFacultyEntry,
                  ]));
                } catch (error) {
                  setCreateFacultyErrorMessage(error.message);
                  // leave the modal visible after an error
                  return;
                }
                setCreateFacultyModalVisible(false);
              }}
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
          ariaLabelledBy="editFaculty"
          closeHandler={(): void => { setEditFacultyModalVisible(false); }}
          onOpen={(): void => {
            setEditFacultyArea(currentFaculty.area.name);
            setEditFacultyHUID(currentFaculty.HUID);
            setEditFacultyFirstName(currentFaculty.firstName || '');
            setEditFacultyLastName(currentFaculty.lastName || '');
            setEditFacultyJointWith(currentFaculty.jointWith || '');
            setEditFacultyCategory(currentFaculty.category);
            setEditFacultyErrorMessage('');
          }}
          isVisible={editFacultyModalVisible}
        >
          <ModalHeader>Edit Faculty</ModalHeader>
          <ModalBody>
            <form id="editFacultyForm">
              <label htmlFor="editFacultyCourseArea">
                Area
                <Dropdown
                  id="editFacultyCourseArea"
                  name="editFacultyCourseArea"
                  options={[{ value: '', label: '' }].concat(metadata.areas.map((area):
                  {value: string; label: string} => ({
                    value: area,
                    label: area,
                  })))}
                  onChange={(event): void => setEditFacultyArea(
                    (event.target as HTMLSelectElement).value
                  )}
                  value={editFacultyArea}
                  required
                />
              </label>
              <TextInput
                id="editFacultyHUID"
                name="editFacultyHUID"
                label="HUID"
                labelPosition={POSITION.TOP}
                placeholder="e.g. 12345678"
                onChange={(event): void => setEditFacultyHUID(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={editFacultyHUID}
                required
              />
              <TextInput
                id="editFacultyFirstName"
                name="editFacultyFirstName"
                label="First name"
                labelPosition={POSITION.TOP}
                onChange={(event): void => setEditFacultyFirstName(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={editFacultyFirstName}
              />
              <TextInput
                id="editFacultyLastName"
                name="editFacultyLastName"
                label="Last name"
                labelPosition={POSITION.TOP}
                onChange={(event): void => setEditFacultyLastName(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={editFacultyLastName}
                required
              />
              <label htmlFor="facultyCategory">
                Category
                <Dropdown
                  id="editFacultyCategory"
                  name="editFacultyCategory"
                  /**
                   * Insert an empty option so that no category is pre-selected in dropdown
                   */
                  options={[{ value: '', label: '' }]
                    .concat(Object.values(FACULTY_TYPE)
                      .map((category):
                      {value: string; label: string} => {
                        const categoryTitle = categoryEnumToTitleCase(category);
                        return {
                          value: category,
                          label: categoryTitle,
                        };
                      }))}
                  onChange={(event): void => setEditFacultyCategory(
                    (event.target as HTMLSelectElement).value
                  )}
                  value={editFacultyCategory}
                  required
                />
              </label>
              <TextInput
                id="editFacultyJointWith"
                name="editFacultyJointWith"
                label="Joint with..."
                labelPosition={POSITION.TOP}
                placeholder="Add 'Joint With' entry"
                onChange={(event): void => setEditFacultyJointWith(
                  (event.target as HTMLInputElement).value.trim()
                )}
                value={editFacultyJointWith}
              />
              <ValidationErrorMessage>
                {editFacultyErrorMessage}
              </ValidationErrorMessage>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              id="editFacultySubmit"
              onClick={async (): Promise<void> => {
                try {
                  const editedFacultyMember = await submitEditFacultyForm();
                  setFacultyMembers(sortFaculty(
                    currentFacultyMembers.map((faculty):
                    ManageFacultyResponseDTO => (
                      faculty.id === editedFacultyMember.id
                        ? editedFacultyMember
                        : faculty
                    ))
                  ));
                } catch (error) {
                  setEditFacultyErrorMessage(error.message);
                  // leave the modal visible after an error
                  return;
                }
                setEditFacultyModalVisible(false);
              }}
              variant={VARIANT.PRIMARY}
            >
              Submit
            </Button>
            <Button
              onClick={(): void => setEditFacultyModalVisible(false)}
              variant={VARIANT.SECONDARY}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

export default FacultyAdmin;
