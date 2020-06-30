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
  categoryEnumToTitleCase,
} from 'common/__tests__/utils/facultyHelperFunctions';
import { POSITION } from 'mark-one/lib/Forms/Label';
import { FACULTY_TYPE } from 'common/constants';
import { FacultyAPI } from 'client/api';
import { MetadataContext } from 'client/context/MetadataContext';

interface CreateFacultyModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * Handler to be invoked when the modal closes
   * e.g. to clear data entered into a form
   */
  onClose?: () => void;
  /**
   * Handler to be invoked when the create is successful
   */
  onSuccess?: (faculty: ManageFacultyResponseDTO) => void;
}

/**
 * This component represents the Create Faculty Modal, which will be used on
 * the Faculty Admin tab
 */
const CreateFacultyModal:
FunctionComponent<CreateFacultyModalProps> = function ({
  isVisible,
  onClose,
  onSuccess,
}): ReactElement {
  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

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
   * The current value of the error message for the Create Faculty Area field
   */
  const [
    createFacultyAreaErrorMessage,
    setCreateFacultyAreaErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Create Faculty HUID field
   */
  const [
    createFacultyHUIDErrorMessage,
    setCreateFacultyHUIDErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Create Faculty Last Name field
   */
  const [
    createFacultyLastNameErrorMessage,
    setCreateFacultyLastNameErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Create Faculty Category field
   */
  const [
    createFacultyCategoryErrorMessage,
    setCreateFacultyCategoryErrorMessage,
  ] = useState('');

  /**
   * The current value of the error message within the Create Faculty modal
   */
  const [
    createFacultyErrorMessage,
    setCreateFacultyErrorMessage,
  ] = useState('');

  /**
   * Submits the create faculty form, checking for valid inputs
   */
  const submitCreateFacultyForm = async ():
  Promise<ManageFacultyResponseDTO> => {
    let isValid = true;
    // Make sure only errors that have not been fixed are shown.
    setCreateFacultyAreaErrorMessage('');
    setCreateFacultyHUIDErrorMessage('');
    setCreateFacultyLastNameErrorMessage('');
    setCreateFacultyCategoryErrorMessage('');
    setCreateFacultyErrorMessage('');
    if (!createFacultyArea) {
      setCreateFacultyAreaErrorMessage('The area is required to submit this form.');
      isValid = false;
    }
    if (!validHUID(createFacultyHUID)) {
      setCreateFacultyHUIDErrorMessage('An HUID is required and must contain 8 digits. Please try again.');
      isValid = false;
    }
    if (!createFacultyLastName) {
      setCreateFacultyLastNameErrorMessage('The faculty\'s last name is required to submit this form.');
      isValid = false;
    }
    if (!createFacultyCategory) {
      setCreateFacultyCategoryErrorMessage('The category is required to submit this form.');
      isValid = false;
    }
    if (!isValid) {
      throw new Error('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
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

  return (
    <Modal
      ariaLabelledBy="createFaculty"
      closeHandler={onClose}
      onClose={(): void => {
        setCreateFacultyArea('');
        setCreateFacultyHUID('');
        setCreateFacultyFirstName('');
        setCreateFacultyLastName('');
        setCreateFacultyJointWith('');
        setCreateFacultyCategory('');
        setCreateFacultyAreaErrorMessage('');
        setCreateFacultyHUIDErrorMessage('');
        setCreateFacultyLastNameErrorMessage('');
        setCreateFacultyCategoryErrorMessage('');
        setCreateFacultyErrorMessage('');
        onClose();
      }}
      isVisible={isVisible}
    >
      <ModalHeader>Create New Faculty</ModalHeader>
      <NoteText>Note: * denotes a required field</NoteText>
      <ModalBody>
        <form id="createFacultyForm">
          <Dropdown
            id="createFacultyCourseArea"
            name="createFacultyCourseArea"
            label="Area"
            /**
                 * Insert an empty option so that no area is pre-selected in dropdown
                 */
            options={
              [{ value: '', label: '' }]
                .concat(metadata.areas.map((area): {
                    value: string;label: string
                  } => ({
                    value: area,
                    label: area,
                  }))
                )
            }
            onChange={(event): void => setCreateFacultyArea(
              (event.target as HTMLSelectElement).value
            )}
            value={createFacultyArea}
            errorMessage={createFacultyAreaErrorMessage}
            isRequired
          />
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
            errorMessage={createFacultyHUIDErrorMessage}
            isRequired
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
            errorMessage={createFacultyLastNameErrorMessage}
            isRequired
          />
          <Dropdown
            id="createFacultyCategory"
            name="createFacultyCategory"
            label="Category"
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
            errorMessage={createFacultyCategoryErrorMessage}
            isRequired
          />
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
          {createFacultyErrorMessage && (
            <ValidationErrorMessage>
              {createFacultyErrorMessage}
            </ValidationErrorMessage>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="createFacultySubmit"
          onClick={async (): Promise<void> => {
            try {
              const newFacultyEntry = await submitCreateFacultyForm();
              onSuccess(newFacultyEntry);
            } catch (error) {
              setCreateFacultyErrorMessage(error.message);
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

export default CreateFacultyModal;
