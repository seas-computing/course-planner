import { OFFERED, TERM } from 'common/constants';
import { offeredEnumToString } from 'common/constants/offered';
import { TermKey } from 'common/constants/term';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  Button,
  Dropdown,
  Form,
  LoadSpinner,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalMessage,
  VARIANT,
} from 'mark-one';
import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { updateCourseInstance } from '../../../api';

interface OfferedModalProps {
  /**
   * True if the modal should be open
   */
  isVisible: boolean;
  /*
   * Information about the semester associated with the instance that is being
   * edited
   */
  currentSemester: {
    term: TERM,
    calendarYear: string,
  };
  /**
   * Full details of the instance for which the offered value is being edited
   */
  currentCourseInstance: CourseInstanceResponseDTO
  /**
   * A function that will close the modal when called
   */
  closeModal: () => void;
  /**
   * Handler to be invoked when the modal is saved
   */
  onSave: (newInstance: CourseInstanceResponseDTO) => void;
}

const OfferedModal: FunctionComponent<OfferedModalProps> = ({
  isVisible,
  currentSemester,
  currentCourseInstance,
  closeModal,
  onSave,
}): ReactElement => {
  /**
   * Ref to attach to the internal modal header
   */
  const modalHeaderRef = useRef<HTMLHeadingElement>(null);

  /**
  * Shift the focus to the modal header when it appears on the page
  */
  const setOfferedModalFocus = (): void => {
    setTimeout(() => modalHeaderRef.current?.focus());
  };

  /**
   * Store any error messages generated inside the modal
   */
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Track whether data is being pushed to the server
   */
  const [saving, setSaving] = useState(false);

  type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const [form, setFormFields] = useState({
    offered: '',
  });

  const updateFormFields = (event: ChangeEvent): void => {
    console.log('got to updateFormFields');
    const target = event.target as FormField;
    setFormFields({
      ...form,
      [target.name]: target.value,
    });
    console.log('here is the form: ', form);
  };

  const instanceIdentifier = currentCourseInstance && currentSemester
    ? `${
      currentCourseInstance.catalogNumber
    }, ${
      currentSemester.term
    } ${
      currentSemester.calendarYear
    }`
    : '';

  useEffect(() => {
    console.log('got to the use effect');
    if (currentSemester && currentCourseInstance) {
      const currentTermKey = currentSemester.term.toLowerCase() as TermKey;
      setFormFields({
        offered: currentCourseInstance[currentTermKey].offered,
      });
    }
  }, [currentSemester, currentCourseInstance]);

  useEffect(() => {
    if (isVisible) {
      setOfferedModalFocus();
      setErrorMessage('');
    }
  }, [isVisible]);

  const saveOffered = async () => {
    try {
      setSaving(true);
      const currentTermKey = currentSemester.term.toLowerCase() as TermKey;
      const results = await updateCourseInstance(
        currentCourseInstance.id,
        {
          ...currentCourseInstance,
          [currentTermKey]: {
            ...currentCourseInstance[currentTermKey],
            offered: form.offered,
          },
        }
      );
      onSave(results);
    } catch (error) {
      const { message } = error as Error;
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      ariaLabelledBy="edit-offered-modal"
      closeHandler={closeModal}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        <span id="edit-offered-header">
          {`Edit Offered Value for ${instanceIdentifier}`}
        </span>
      </ModalHeader>
      <ModalBody>
        {saving
          ? (
            <LoadSpinner>Saving</LoadSpinner>
          )
          : (
            <Form
              id="editOfferedForm"
              label="Edit Offered Form"
            >
              <Dropdown
                id="offered"
                name="offered"
                label="Edit Offered Value"
                options={
                  Object.values(OFFERED)
                    .filter((value) => value !== OFFERED.RETIRED)
                    .map((offeredValue): {
                      value: string; label: string
                    } => ({
                      value: offeredValue,
                      label: offeredEnumToString(offeredValue),
                    }))
                }
                onChange={updateFormFields}
                value={form.offered}
                isRequired
              />
            </Form>
          )}
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={saveOffered}
          variant={VARIANT.PRIMARY}
        >
          Save
        </Button>
        {errorMessage
          ? (
            <ModalMessage variant={VARIANT.NEGATIVE}>
              {errorMessage}
            </ModalMessage>
          ) : null}
        <Button
          onClick={closeModal}
          variant={VARIANT.SECONDARY}
          disabled={false}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default OfferedModal;
