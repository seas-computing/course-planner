import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
} from 'react';
import {
  VARIANT,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Dropdown,
  TextInput,
  ValidationErrorMessage,
  NoteText,
} from 'mark-one';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import {
  validHUID,
  facultyTypeEnumToTitleCase,
} from 'common/__tests__/utils/facultyHelperFunctions';
import { POSITION } from 'mark-one/lib/Forms/Label';
import { FACULTY_TYPE } from 'common/constants';
import { FacultyAPI } from 'client/api';
import { MetadataContext } from 'client/context/MetadataContext';
import ValidationException from 'common/errors/ValidationException';

interface EditFacultyModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current faculty being edited
   */
  currentFaculty: ManageFacultyResponseDTO;
  /**
   * Handler to be invoked when the modal closes
   * e.g. to clear data entered into a form
   */
  onClose?: () => void;
  /**
   * Handler to be invoked when the edit is successful
   */
  onSuccess?: (faculty: ManageFacultyResponseDTO) => void;
}

/**
 * This component represents the Edit Faculty Modal, which will be used on
 * the Faculty Admin tab
 */
const EditFacultyModal: FunctionComponent<EditFacultyModalProps> = function ({
  isVisible,
  onClose,
  onSuccess,
  currentFaculty,
}): ReactElement {
  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

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
   * The current value of the error message for the Edit Faculty Area field
   */
  const [
    editFacultyAreaErrorMessage,
    setEditFacultyAreaErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Edit Faculty HUID field
   */
  const [
    editFacultyHUIDErrorMessage,
    setEditFacultyHUIDErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Edit Faculty Last Name field
   */
  const [
    editFacultyLastNameErrorMessage,
    setEditFacultyLastNameErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Edit Faculty Category field
   */
  const [
    editFacultyCategoryErrorMessage,
    setEditFacultyCategoryErrorMessage,
  ] = useState('');

  /**
   * The current value of the error message within the Edit Faculty modal
   */
  const [
    editFacultyErrorMessage,
    setEditFacultyErrorMessage,
  ] = useState('');

  /**
   * Submits the edit faculty form, checking for valid inputs
   */
  const submitEditFacultyForm = async ():
  Promise<ManageFacultyResponseDTO> => {
    let isValid = true;
    // Make sure only errors that have not been fixed are shown.
    setEditFacultyAreaErrorMessage('');
    setEditFacultyHUIDErrorMessage('');
    setEditFacultyLastNameErrorMessage('');
    setEditFacultyCategoryErrorMessage('');
    setEditFacultyErrorMessage('');
    if (!editFacultyArea) {
      setEditFacultyAreaErrorMessage('The area is required to submit this form.');
      isValid = false;
    }
    if (!validHUID(editFacultyHUID)) {
      setEditFacultyHUIDErrorMessage('An HUID is required and must contain 8 digits. Please try again.');
      isValid = false;
    }
    if (!editFacultyLastName) {
      setEditFacultyLastNameErrorMessage('The faculty\'s last name is required to submit this form.');
      isValid = false;
    }
    if (!editFacultyCategory) {
      setEditFacultyCategoryErrorMessage('The category is required to submit this form.');
      isValid = false;
    }
    if (!isValid) {
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
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
    <Modal
      ariaLabelledBy="editFaculty"
      closeHandler={onClose}
      onOpen={(): void => {
        setEditFacultyArea(currentFaculty.area.name);
        setEditFacultyHUID(currentFaculty.HUID);
        setEditFacultyFirstName(currentFaculty.firstName || '');
        setEditFacultyLastName(currentFaculty.lastName);
        setEditFacultyJointWith(currentFaculty.jointWith || '');
        setEditFacultyCategory(currentFaculty.category);
        setEditFacultyAreaErrorMessage('');
        setEditFacultyHUIDErrorMessage('');
        setEditFacultyLastNameErrorMessage('');
        setEditFacultyCategoryErrorMessage('');
        setEditFacultyErrorMessage('');
      }}
      isVisible={isVisible}
      onClose={onClose}
    >
      <ModalHeader>Edit Faculty</ModalHeader>
      <NoteText>Note: * denotes a required field</NoteText>
      <ModalBody>
        <form id="editFacultyForm">
          <Dropdown
            id="editFacultyCourseArea"
            name="editFacultyCourseArea"
            label="Area"
            options={[{ value: '', label: '' }].concat(metadata.areas.map((area):
            {value: string; label: string} => ({
              value: area,
              label: area,
            })))}
            onChange={(event): void => setEditFacultyArea(
              (event.target as HTMLSelectElement).value
            )}
            value={editFacultyArea}
            errorMessage={editFacultyAreaErrorMessage}
            isRequired
          />
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
            errorMessage={editFacultyHUIDErrorMessage}
            isRequired
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
            errorMessage={editFacultyLastNameErrorMessage}
            isRequired
          />
          <Dropdown
            id="editFacultyCategory"
            name="editFacultyCategory"
            label="Category"
            /**
             * Insert an empty option so that no category is pre-selected in dropdown
             */
            options={[{ value: '', label: '' }]
              .concat(Object.values(FACULTY_TYPE)
                .map((category):
                {value: string; label: string} => {
                  const categoryTitle = facultyTypeEnumToTitleCase(category);
                  return {
                    value: category,
                    label: categoryTitle,
                  };
                }))}
            onChange={(event): void => setEditFacultyCategory(
              (event.target as HTMLSelectElement).value
            )}
            value={editFacultyCategory}
            errorMessage={editFacultyCategoryErrorMessage}
            isRequired
          />
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
          {editFacultyErrorMessage && (
            <ValidationErrorMessage>
              {editFacultyErrorMessage}
            </ValidationErrorMessage>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="editFacultySubmit"
          onClick={async (): Promise<void> => {
            try {
              const editedFacultyMember = await submitEditFacultyForm();
              onSuccess(editedFacultyMember);
            } catch (error) {
              setEditFacultyErrorMessage(error.message);
              // leave the modal visible after an error
              return;
            }
            onClose();
          }}
          variant={VARIANT.PRIMARY}
        >
          Submit
        </Button>
        <Button
          onClick={onClose}
          variant={VARIANT.SECONDARY}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditFacultyModal;
