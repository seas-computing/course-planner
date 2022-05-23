import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VARIANT,
  TextInput,
  ModalMessage,
  LoadSpinner,
} from 'mark-one';
import CourseInstanceResponseDTO, { Instance } from 'common/dto/courses/CourseInstanceResponse';
import { TERM } from 'common/constants';
import { TermKey } from 'common/constants/term';
import { updateCourseInstance } from 'client/api';
import CourseInstanceUpdateDTO from 'common/dto/courses/CourseInstanceUpdate.dto';
import { EnrollmentField } from './tableFields';

interface EnrollmentModalProps {
  /**
   * True if the modal should be open
   */
  isVisible: boolean;

  /**
   * Handler to be invoked when the modal closes
   */
  onClose: () => void;

  /**
   * Handler used to recieve the updated data from the modal
   */
  onSave: (course: CourseInstanceUpdateDTO) => void;

  /**
   * The course instance for a given semester enrollment data is being udpated
   * on
   */
  course: CourseInstanceResponseDTO;

  /**
   * The semester within the current course being edited
   */
  currentSemester: {
    term: TERM,
    calendarYear: string
  };
}

/**
* Displays 3 input fields to allow users to edit the enrollment data for a given
* course
*/
const EnrollmentModal: FunctionComponent<EnrollmentModalProps> = ({
  isVisible,
  onClose,
  onSave,
  course,
  currentSemester,
}): ReactElement => {
  /**
   * Ref to attach to the internal modal header
   */
  const modalHeaderRef = useRef<HTMLHeadingElement>(null);

  /**
   * Represents enrollment data in local component state prior to being
   * sent back to the server for persistence (and updating local application
   * state).
   * String values are used since this is the type of data returned by a
   * [[TextInput]] and also because the data should be allowed to be entered,
   * but then validated (and finally sanitized) before being saved
   * @example ```
   * { studyCardEnrollment: "12" preEnrollment: null, actualEnrollment: null }
   * ```
   */
  type EnrollmentData = Partial<Record<keyof Instance & ('preEnrollment'|'actualEnrollment'|'studyCardEnrollment'), string>>;

  /**
   * Map containing key-value pairs of various enrollment fields and their
   * count. This is used to store the value used for field updates.
   */
  const [
    enrollmentData,
    setEnrollmentData,
  ] = useState<EnrollmentData>();

  /**
   * Shows and hides the loading spinner while saving enrollment data
   */
  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    validationErrors,
    setValidationErrors,
  ] = useState<string[]>([]);

  const [
    instance,
    setInstance,
  ] = useState<Instance>(null);

  /**
   * Effect hook to create state fields for each form field
   */
  useEffect(() => {
    if (course && isVisible) {
      const semKey = currentSemester.term.toLowerCase() as TermKey;
      setInstance(course[semKey]);
      setEnrollmentData({
        preEnrollment: instance?.preEnrollment?.toString() ?? null,
        actualEnrollment: instance?.actualEnrollment?.toString() ?? null,
        studyCardEnrollment: instance?.studyCardEnrollment?.toString() ?? null,
      });
    }
  }, [
    setEnrollmentData,
    setInstance,
    currentSemester.term,
    course,
    isVisible,
    instance,
  ]);

  const enrollmentFields: EnrollmentField[] = [
    {
      name: 'Pre-Registration',
      key: 'preEnrollment',
      icon: null,
    },
    {
      name: 'Enrollment Deadline',
      key: 'studyCardEnrollment',
      icon: null,
    },
    {
      name: 'Final Enrollment',
      key: 'actualEnrollment',
      icon: null,
    },
  ];

  /**
   * Look up a given field name in [[enrollmentFields]] and retrieve the
   * humnan friendly name for display in an error message. This enables a more
   * friendly message like "Final Enrollment may not contain alphabetical characters"
   * instead of "actualEnrollment may not contain alphabetical characters"
   */
  const getDisplayName = (fieldName: string) => enrollmentFields
    .find(({ key }) => key.toString() === fieldName).name;

  /**
   * Sanitizes the [[enrollmentData]] state fields ready for sending to the API.
   * This includes removing null values, converting stringified numbers to
   * integers (i.e: "10" becomes 10)
   */
  const sanitizeEnrollmentData = (
    data: EnrollmentData
  ) => Object.entries(data)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => [key, parseInt(value, 10)])
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  /**
   * Submits the updated enrollment data to the server and passes the response
   * through to the update handler
   */
  const saveEnrollmentData = async () => {
    const errorMessages = Object.entries(enrollmentData)
      // Don't try to validate empty fields
      .filter(([, value]) => (value || null) !== null)
      // Run validation for everything that's not equal to empty string
      .map(([fieldName, fieldValue]) => {
        const errors: string[] = [];
        const displayName = getDisplayName(fieldName);
        if (new RegExp(/[A-Z]/i).test(fieldValue.toString())) {
          errors.push(`${displayName} cannot contain alphabetical characters`);
        } else if (parseInt(fieldValue, 10) < 0) {
          errors.push(`${displayName} cannot be negative`);
        }
        return errors;
      })
      .reduce((acc, val) => acc.concat(val), []);

    if (errorMessages.length > 0) {
      setSaving(false);
      setValidationErrors(errorMessages);
    } else {
      setSaving(true);
      const results = await updateCourseInstance(
        instance.id,
        {
          offered: instance.offered,
          ...sanitizeEnrollmentData(enrollmentData),
        }
      );
      onSave(results);
      setSaving(false);
    }
  };

  return (
    <Modal
      ariaLabelledBy="enrollment-modal-header"
      isVisible={isVisible}
      closeHandler={onClose}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        <span id="enrollment-modal-header">
          {`Enrollment for ${course?.catalogNumber}, ${currentSemester?.term} ${currentSemester.calendarYear}`}
        </span>
      </ModalHeader>
      <ModalBody>
        {
          saving ? (<LoadSpinner>Saving Enrollment Data</LoadSpinner>) : (
            enrollmentFields.map(({ key, name }) => (
              <TextInput
                key={key}
                id={key}
                name={key}
                label={name}
                value={enrollmentData?.[key]?.toString() || ''}
                onChange={
                  ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                    setEnrollmentData((state) => ({
                      ...state,
                      [key]: value,
                    }));
                  }
                }
              />
            ))
          )
        }
        {
          validationErrors.length > 0
            ? (
              <ModalMessage variant={VARIANT.NEGATIVE}>
                {validationErrors.join(', ')}
              </ModalMessage>
            ) : null
        }
      </ModalBody>
      <ModalFooter>
        {
          saving ? null
            : (
              <Button
                onClick={saveEnrollmentData}
                variant={VARIANT.PRIMARY}
              >
                Save
              </Button>
            )
        }
      </ModalFooter>
    </Modal>
  );
};

export default EnrollmentModal;
