import axios from 'axios';
import { MetadataContext } from 'client/context';
import { OFFERED, TERM } from 'common/constants';
import { offeredEnumToString } from 'common/constants/offered';
import { TermKey } from 'common/constants/term';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import CourseInstanceUpdateDTO from 'common/dto/courses/CourseInstanceUpdate.dto';
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
  useContext,
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
  onClose: () => void;
  /**
   * Handler to be invoked when the modal is saved
   */
  onSave: (updatedInstance: CourseInstanceUpdateDTO) => void;
}

export interface BadRequestMessageInfo {
  children: unknown[];
  constraints: Record<string, string>;
  property: string;
}

export interface ErrorInfo {
  statusCode: string;
  error: string;
}

export interface BadRequestInfo extends ErrorInfo {
  message: BadRequestMessageInfo[];
}

export interface ServerErrorInfo extends ErrorInfo {
  message: Record<string, string>;
}

const OfferedModal: FunctionComponent<OfferedModalProps> = ({
  isVisible,
  currentSemester,
  currentCourseInstance,
  onClose,
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

  const [form, setFormFields] = useState<{offered: OFFERED}>();

  const updateFormFields = (
    event: ChangeEvent<HTMLSelectElement & {value: OFFERED}>
  ): void => {
    const { target } = event;
    setFormFields({
      ...form,
      [target.name]: target.value,
    });
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
    setSaving(true);
    let results: CourseInstanceUpdateDTO;
    try {
      const currentTermKey = currentSemester.term.toLowerCase() as TermKey;
      results = await updateCourseInstance(
        currentCourseInstance[currentTermKey].id,
        {
          offered: form.offered,
          preEnrollment: currentCourseInstance[currentTermKey].preEnrollment,
          studyCardEnrollment: currentCourseInstance[currentTermKey]
            .studyCardEnrollment,
          actualEnrollment: currentCourseInstance[currentTermKey]
            .actualEnrollment,
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if ('error' in error.response.data
          && (error.response.data as ErrorInfo).error === 'Bad Request') {
          const serverError = error.response.data as BadRequestInfo;
          // If only a single message is returned, convert it to an array so
          // that it can be mapped over.
          if (!Array.isArray(serverError.message)) {
            setErrorMessage(serverError.message);
          } else {
            setErrorMessage(serverError.message.map((message) => {
              const values = Object.values(message.constraints);
              return values.join('; ');
            }).join('; '));
          }
        } else {
          const axiosError = error.response.data as Error;
          setErrorMessage(axiosError.message);
        }
      } else if (results === undefined) {
        const { message } = error as Error;
        setErrorMessage(`Failed to save course data. Please try again later.
        ${message}`);
      }
    } finally {
      setSaving(false);
    }
    if (results) {
      onSave(results);
    }
  };
  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

  return (
    <Modal
      ariaLabelledBy="edit-offered-modal"
      closeHandler={onClose}
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
                label="Edit Offered Value Dropdown"
                options={
                  Object.values(OFFERED)
                    .map((offeredValue): {
                      value: OFFERED; label: string
                    } => ({
                      value: offeredValue,
                      label: offeredEnumToString(offeredValue),
                    }))
                }
                onChange={updateFormFields}
                value={form?.offered}
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
          onClick={onClose}
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
