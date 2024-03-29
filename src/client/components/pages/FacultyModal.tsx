import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  Ref,
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
  POSITION,
  Form,
} from 'mark-one';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import {
  validHUID,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
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
  onClose: () => void;
  /**
   * Handler to be invoked when the edit is successful
   */
  onSuccess: (faculty: ManageFacultyResponseDTO) => Promise<void>;
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
   * Keeps track of whether the user has altered fields in the form to determine
   * whether to show a confirmation dialog on modal close
   */
  const [
    isChanged,
    setIsChanged,
  ] = useState(false);

  const confirmMessage = "You have unsaved changes. Click 'OK' to disregard changes, or 'Cancel' to continue editing.";

  const [form, setFormFields] = useState({
    courseArea: '',
    HUID: '',
    firstName: '',
    lastName: '',
    category: '',
    jointWith: '',
    notes: '',
  });

  type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const updateFormFields = (event: ChangeEvent): void => {
    const target = event.target as FormField;
    setFormFields({
      ...form,
      [target.name]:
      target.value,
    });
    setIsChanged(true);
  };

  /**
   * The current value of the error message for the Faculty Area field
   */
  const [
    areaErrorMessage,
    setAreaErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty HUID field
   */
  const [
    HUIDErrorMessage,
    setHUIDErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty Last Name field
   */
  const [
    lastNameErrorMessage,
    setLastNameErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Faculty Category field
   */
  const [
    categoryErrorMessage,
    setCategoryErrorMessage,
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
  const modalHeaderRef: Ref<HTMLHeadingElement> = useRef(null);

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
    setAreaErrorMessage('');
    setHUIDErrorMessage('');
    setLastNameErrorMessage('');
    setCategoryErrorMessage('');
    setFacultyErrorMessage('');
    if (!form.courseArea) {
      setAreaErrorMessage('Area is required to submit this form.');
      isValid = false;
    }
    if (!validHUID(form.HUID)) {
      setHUIDErrorMessage('HUID is required and must contain 8 digits.');
      isValid = false;
    }
    if (!form.lastName) {
      setLastNameErrorMessage('Last name is required to submit this form.');
      isValid = false;
    }
    if (!form.category) {
      setCategoryErrorMessage('Category is required to submit this form.');
      isValid = false;
    }
    if (!isValid) {
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }
    let result: ManageFacultyResponseDTO;
    if (currentFaculty) {
      result = await FacultyAPI.editFaculty({
        id: currentFaculty.id,
        area: form.courseArea,
        HUID: form.HUID,
        firstName: form.firstName,
        lastName: form.lastName,
        jointWith: form.jointWith,
        category: form.category as FACULTY_TYPE,
        notes: form.notes,
      });
    } else {
      result = await FacultyAPI.createFaculty({
        area: form.courseArea,
        HUID: form.HUID,
        firstName: form.firstName,
        lastName: form.lastName,
        jointWith: form.jointWith,
        category: form.category as FACULTY_TYPE,
        notes: form.notes,
      });
    }
    return result;
  };
  useEffect(() => {
    if (isVisible) {
      setFormFields({
        courseArea: currentFaculty ? currentFaculty.area.name : '',
        HUID: currentFaculty ? (currentFaculty.HUID || '') : '',
        firstName: currentFaculty ? (currentFaculty.firstName || '') : '',
        lastName: currentFaculty ? (currentFaculty.lastName || '') : '',
        jointWith: currentFaculty ? (currentFaculty.jointWith || '') : '',
        category: currentFaculty ? currentFaculty.category : '',
        notes: currentFaculty ? (currentFaculty.notes || '') : '',
      });
      setAreaErrorMessage('');
      setHUIDErrorMessage('');
      setLastNameErrorMessage('');
      setCategoryErrorMessage('');
      setFacultyErrorMessage('');
      setFacultyModalFocus();
    }
  }, [isVisible, currentFaculty]);

  /**
   * Used to add the before unload listener in the case that a form field is changed
   */
  useEffect(() => {
    /**
     * Checks to see if there are any unsaved changes in the modal when the user
     * refreshes the page. If there are unsaved changes, the browser displays a
     * warning message to confirm the page reload. If the user selects cancel, the
     * user can continue making changes in the modal.
     */
    const onBeforeUnload = (event: Event) => {
      if (!isChanged) return;
      event.preventDefault();
      // Need to disable this rule for browser compatibility reasons
      // eslint-disable-next-line no-param-reassign
      event.returnValue = false;
      return confirmMessage;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [isChanged]);

  /**
   * Called when the modal is closed. If there are any unsaved changes,
   * a warning message appears, and the user must confirm discarding the unsaved
   * changes in order to close the modal. If the user selects cancel, the user
   * can continue making changes in the modal.
   */
  const onModalClose = () => {
    if (isChanged) {
      // eslint-disable-next-line no-alert
      if (window.confirm(confirmMessage)) {
        setIsChanged(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      ariaLabelledBy="editFaculty"
      closeHandler={onModalClose}
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
        <Form
          id="editFacultyForm"
          label="Edit Faculty Form"
        >
          <Dropdown
            id="courseArea"
            name="courseArea"
            label="Edit Faculty Course Area"
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
            onChange={updateFormFields}
            value={form.courseArea}
            errorMessage={areaErrorMessage}
            isRequired
          />
          <TextInput
            id="HUID"
            name="HUID"
            label="Edit Faculty HUID"
            labelPosition={POSITION.TOP}
            placeholder="e.g. 12345678"
            onChange={updateFormFields}
            value={form.HUID}
            errorMessage={HUIDErrorMessage}
            isRequired
          />
          <TextInput
            id="firstName"
            name="firstName"
            label="Edit Faculty First Name"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Jane"
            onChange={updateFormFields}
            value={form.firstName}
          />
          <TextInput
            id="lastName"
            name="lastName"
            label="Edit Faculty Last Name"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Smith"
            onChange={updateFormFields}
            value={form.lastName}
            errorMessage={lastNameErrorMessage}
            isRequired
          />
          <Dropdown
            id="category"
            name="category"
            label="Edit Faculty Category"
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
            onChange={updateFormFields}
            value={form.category}
            errorMessage={categoryErrorMessage}
            isRequired
          />
          <TextInput
            id="jointWith"
            name="jointWith"
            label="Edit Faculty Joint With..."
            labelPosition={POSITION.TOP}
            placeholder="Add 'Joint With' entry"
            onChange={updateFormFields}
            value={form.jointWith}
          />
          <TextInput
            id="notes"
            name="notes"
            label="Edit Faculty Notes"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Prefers Room X"
            onChange={updateFormFields}
            value={form.notes}
          />
          {facultyErrorMessage && (
            <ValidationErrorMessage
              id="editFacultyModalErrorMessage"
            >
              {facultyErrorMessage}
            </ValidationErrorMessage>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="editFacultySubmit"
          onClick={async (): Promise<void> => {
            try {
              const editedFacultyMember = await submitEditFacultyForm();
              await onSuccess(editedFacultyMember);
            } catch (error) {
              setFacultyErrorMessage((error as Error).message);
              // leave the modal visible after an error
              return;
            }
            setIsChanged(false);
            onClose();
          }}
          variant={VARIANT.PRIMARY}
        >
          Submit
        </Button>
        <Button
          onClick={onModalClose}
          variant={VARIANT.SECONDARY}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

FacultyModal.defaultProps = {
  currentFaculty: null,
};

export default FacultyModal;
