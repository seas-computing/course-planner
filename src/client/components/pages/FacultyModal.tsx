import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useRef,
  useEffect,
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

interface FacultyModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current faculty being edited, or undefined if creating a new faculty.
   */
  currentFaculty?: ManageFacultyResponseDTO;
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
 * This component represents the Faculty Modals, which will be used on
 * the Faculty Admin tab
 */
const FacultyModal: FunctionComponent<FacultyModalProps> = function ({
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
   * The currently selected value of the area dropdown in the Faculty Modal
   */
  const [
    editFacultyArea,
    setEditFacultyArea,
  ] = useState('');

  /**
   * The current value of the HUID text field in the Faculty modal
   */
  const [
    editFacultyHUID,
    setEditFacultyHUID,
  ] = useState('');

  /**
   * The current value of the first name field in the Faculty modal
   */
  const [
    editFacultyFirstName,
    setEditFacultyFirstName,
  ] = useState('');

  /**
   * The current value of the last name field in the Faculty modal
   */
  const [
    editFacultyLastName,
    setEditFacultyLastName,
  ] = useState('');

  /**
   * The current value of the faculty category dropdown in the
   * Faculty modal
   */
  const [
    editFacultyCategory,
    setEditFacultyCategory,
  ] = useState('');

  /**
   * The current value of the joint with field in the Faculty modal
   */
  const [
    editFacultyJointWith,
    setEditFacultyJointWith,
  ] = useState('');

  /**
   * The current value of the notes field in the Faculty modal
   */
  const [
    editFacultyNotes,
    setEditFacultyNotes,
  ] = useState('');

  /**
   * The current value of the error message for the Faculty Area field
   */
  const [
    editFacultyAreaErrorMessage,
    setEditFacultyAreaErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty HUID field
   */
  const [
    editFacultyHUIDErrorMessage,
    setEditFacultyHUIDErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty Last Name field
   */
  const [
    editFacultyLastNameErrorMessage,
    setEditFacultyLastNameErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty Category field
   */
  const [
    editFacultyCategoryErrorMessage,
    setEditFacultyCategoryErrorMessage,
  ] = useState('');

  /**
   * The current value of the error message within the Faculty modal
   */
  const [
    editFacultyErrorMessage,
    setEditFacultyErrorMessage,
  ] = useState('');

  /**
   * The current value of the Create Faculty Modal ref
   */
  const modalHeaderRef = useRef(null);

  /**
   * Set the ref focus.
   * Since modal may not have been rendered in DOM, wait for it to be
   * rendered by letting next task of event queue run first.
   */
  const setFacultyModalFocus = (): void => {
    setTimeout((): void => modalHeaderRef.current.focus());
  };

  /**
   * Submits the faculty form, checking for valid inputs
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
      setEditFacultyAreaErrorMessage('Area is required to submit this form.');
      isValid = false;
    }
    if (!validHUID(editFacultyHUID)) {
      setEditFacultyHUIDErrorMessage('HUID is required and must contain 8 digits.');
      isValid = false;
    }
    if (!editFacultyLastName) {
      setEditFacultyLastNameErrorMessage('Last name is required to submit this form.');
      isValid = false;
    }
    if (!editFacultyCategory) {
      setEditFacultyCategoryErrorMessage('Category is required to submit this form.');
      isValid = false;
    }
    if (!isValid) {
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }
    let result: ManageFacultyResponseDTO;
    if (currentFaculty) {
      result = await FacultyAPI.editFaculty({
        id: currentFaculty.id,
        area: editFacultyArea,
        HUID: editFacultyHUID,
        firstName: editFacultyFirstName,
        lastName: editFacultyLastName,
        jointWith: editFacultyJointWith,
        category: editFacultyCategory as FACULTY_TYPE,
        notes: editFacultyNotes,
      });
    } else {
      result = await FacultyAPI.createFaculty({
        area: editFacultyArea,
        HUID: editFacultyHUID,
        firstName: editFacultyFirstName,
        lastName: editFacultyLastName,
        jointWith: editFacultyJointWith,
        category: editFacultyCategory as FACULTY_TYPE,
        notes: editFacultyNotes,
      });
    }
    return result;
  };
  useEffect((): void => {
    if (isVisible) {
      setEditFacultyArea(currentFaculty ? currentFaculty.area.name : '');
      setEditFacultyHUID(currentFaculty ? currentFaculty.HUID : '');
      setEditFacultyFirstName(currentFaculty ? (currentFaculty.firstName || '') : '');
      setEditFacultyLastName(currentFaculty ? currentFaculty.lastName : '');
      setEditFacultyJointWith(currentFaculty ? (currentFaculty.jointWith || '') : '');
      setEditFacultyCategory(currentFaculty ? currentFaculty.category : '');
      setEditFacultyNotes(currentFaculty ? currentFaculty.notes : '');
      setEditFacultyAreaErrorMessage('');
      setEditFacultyHUIDErrorMessage('');
      setEditFacultyLastNameErrorMessage('');
      setEditFacultyCategoryErrorMessage('');
      setEditFacultyErrorMessage('');
      setFacultyModalFocus();
    }
  }, [isVisible]);
  return (
    <Modal
      ariaLabelledBy="editFaculty"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {currentFaculty ? 'Edit Faculty' : 'Create New Faculty'}
      </ModalHeader>
      <ModalBody>
        <NoteText>Note: * denotes a required field</NoteText>
        <form id="editFacultyForm">
          <Dropdown
            id="editFacultyCourseArea"
            name="editFacultyCourseArea"
            label="Area"
            // Insert an empty option so that no area is pre-selected in dropdown
            options={
              [{ value: '', label: '' }]
                .concat(metadata.areas.map((area): {
                  value: string;label: string;
                } => ({
                  value: area,
                  label: area,
                })))
            }
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
            placeholder="e.g. Jane"
            onChange={(event): void => setEditFacultyFirstName(
              (event.target as HTMLInputElement).value
            )}
            value={editFacultyFirstName}
          />
          <TextInput
            id="editFacultyLastName"
            name="editFacultyLastName"
            label="Last name"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Smith"
            onChange={(event): void => setEditFacultyLastName(
              (event.target as HTMLInputElement).value
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
              (event.target as HTMLInputElement).value
            )}
            value={editFacultyJointWith}
          />
          <TextInput
            id="editFacultyNotes"
            name="editFacultyNotes"
            label="Notes"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Prefers Room X"
            onChange={(event): void => setEditFacultyNotes(
              (event.target as HTMLInputElement).value
            )}
            value={editFacultyNotes}
          />
          {editFacultyErrorMessage && (
            <ValidationErrorMessage
              id="editFacultyModalErrorMessage"
            >
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

export default FacultyModal;
