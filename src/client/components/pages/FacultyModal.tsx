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
} from 'common/utils/facultyHelperFunctions';
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
    facultyArea,
    setFacultyArea,
  ] = useState('');

  /**
   * The current value of the HUID text field in the Faculty modal
   */
  const [
    facultyHUID,
    setFacultyHUID,
  ] = useState('');

  /**
   * The current value of the first name field in the Faculty modal
   */
  const [
    facultyFirstName,
    setFacultyFirstName,
  ] = useState('');

  /**
   * The current value of the last name field in the Faculty modal
   */
  const [
    facultyLastName,
    setFacultyLastName,
  ] = useState('');

  /**
   * The current value of the faculty category dropdown in the
   * Faculty modal
   */
  const [
    facultyCategory,
    setFacultyCategory,
  ] = useState('');

  /**
   * The current value of the joint with field in the Faculty modal
   */
  const [
    facultyJointWith,
    setFacultyJointWith,
  ] = useState('');

  /**
   * The current value of the notes field in the Faculty modal
   */
  const [
    facultyNotes,
    setFacultyNotes,
  ] = useState('');

  /**
   * The current value of the error message for the Faculty Area field
   */
  const [
    facultyAreaErrorMessage,
    setFacultyAreaErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty HUID field
   */
  const [
    facultyHUIDErrorMessage,
    setFacultyHUIDErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty Last Name field
   */
  const [
    facultyLastNameErrorMessage,
    setFacultyLastNameErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty Category field
   */
  const [
    facultyCategoryErrorMessage,
    setFacultyCategoryErrorMessage,
  ] = useState('');

  /**
   * The current value of the error message within the Faculty modal
   */
  const [
    facultyErrorMessage,
    setFacultyErrorMessage,
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
    setFacultyAreaErrorMessage('');
    setFacultyHUIDErrorMessage('');
    setFacultyLastNameErrorMessage('');
    setFacultyCategoryErrorMessage('');
    setFacultyErrorMessage('');
    if (!facultyArea) {
      setFacultyAreaErrorMessage('Area is required to submit this form.');
      isValid = false;
    }
    if (!validHUID(facultyHUID)) {
      setFacultyHUIDErrorMessage('HUID is required and must contain 8 digits.');
      isValid = false;
    }
    if (!facultyLastName) {
      setFacultyLastNameErrorMessage('Last name is required to submit this form.');
      isValid = false;
    }
    if (!facultyCategory) {
      setFacultyCategoryErrorMessage('Category is required to submit this form.');
      isValid = false;
    }
    if (!isValid) {
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }
    let result: ManageFacultyResponseDTO;
    if (currentFaculty) {
      result = await FacultyAPI.editFaculty({
        id: currentFaculty.id,
        area: facultyArea,
        HUID: facultyHUID,
        firstName: facultyFirstName,
        lastName: facultyLastName,
        jointWith: facultyJointWith,
        category: facultyCategory as FACULTY_TYPE,
        notes: facultyNotes,
      });
    } else {
      result = await FacultyAPI.createFaculty({
        area: facultyArea,
        HUID: facultyHUID,
        firstName: facultyFirstName,
        lastName: facultyLastName,
        jointWith: facultyJointWith,
        category: facultyCategory as FACULTY_TYPE,
        notes: facultyNotes,
      });
    }
    return result;
  };
  useEffect((): void => {
    if (isVisible) {
      setFacultyArea(currentFaculty ? currentFaculty.area.name : '');
      setFacultyHUID(currentFaculty ? currentFaculty.HUID : '');
      setFacultyFirstName(currentFaculty ? (currentFaculty.firstName || '') : '');
      setFacultyLastName(currentFaculty ? currentFaculty.lastName : '');
      setFacultyJointWith(currentFaculty ? (currentFaculty.jointWith || '') : '');
      setFacultyCategory(currentFaculty ? currentFaculty.category : '');
      setFacultyNotes(currentFaculty ? currentFaculty.notes : '');
      setFacultyAreaErrorMessage('');
      setFacultyHUIDErrorMessage('');
      setFacultyLastNameErrorMessage('');
      setFacultyCategoryErrorMessage('');
      setFacultyErrorMessage('');
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
            onChange={(event): void => setFacultyArea(
              (event.target as HTMLSelectElement).value
            )}
            value={facultyArea}
            errorMessage={facultyAreaErrorMessage}
            isRequired
          />
          <TextInput
            id="editFacultyHUID"
            name="editFacultyHUID"
            label="HUID"
            labelPosition={POSITION.TOP}
            placeholder="e.g. 12345678"
            onChange={(event): void => setFacultyHUID(
              (event.target as HTMLInputElement).value.trim()
            )}
            value={facultyHUID}
            errorMessage={facultyHUIDErrorMessage}
            isRequired
          />
          <TextInput
            id="editFacultyFirstName"
            name="editFacultyFirstName"
            label="First name"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Jane"
            onChange={(event): void => setFacultyFirstName(
              (event.target as HTMLInputElement).value
            )}
            value={facultyFirstName}
          />
          <TextInput
            id="editFacultyLastName"
            name="editFacultyLastName"
            label="Last name"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Smith"
            onChange={(event): void => setFacultyLastName(
              (event.target as HTMLInputElement).value
            )}
            value={facultyLastName}
            errorMessage={facultyLastNameErrorMessage}
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
            onChange={(event): void => setFacultyCategory(
              (event.target as HTMLSelectElement).value
            )}
            value={facultyCategory}
            errorMessage={facultyCategoryErrorMessage}
            isRequired
          />
          <TextInput
            id="editFacultyJointWith"
            name="editFacultyJointWith"
            label="Joint with..."
            labelPosition={POSITION.TOP}
            placeholder="Add 'Joint With' entry"
            onChange={(event): void => setFacultyJointWith(
              (event.target as HTMLInputElement).value
            )}
            value={facultyJointWith}
          />
          <TextInput
            id="editFacultyNotes"
            name="editFacultyNotes"
            label="Notes"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Prefers Room X"
            onChange={(event): void => setFacultyNotes(
              (event.target as HTMLInputElement).value
            )}
            value={facultyNotes}
          />
          {facultyErrorMessage && (
            <ValidationErrorMessage
              id="editFacultyModalErrorMessage"
            >
              {facultyErrorMessage}
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
              setFacultyErrorMessage(error.message);
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
