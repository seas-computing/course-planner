import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
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
 * Array of enrollment fields used to generate the form in the modal
 */
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
   * A map of fields and wether or not they are valid
   * e.g: `{ actualEnrollment: false }`
   */
  type FieldState = Record<keyof EnrollmentData, boolean>;

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

  /**
   * Array of validation errors to be shown to the user at the bottom of the
   * modal
   */
  const [
    fieldState,
    setFieldState,
  ] = useState<FieldState>({
    actualEnrollment: true,
    preEnrollment: true,
    studyCardEnrollment: true,
  });

  /**
   * The current course instance that enrollment data is being edited for
   */
  const [
    instance,
    setInstance,
  ] = useState<Instance>(null);

  /**
   * Controls wehther or not the unsaved changes message should pop up on save
   */
  const [
    changed,
    setChanged,
  ] = useState(false);

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

  /**
   * Validates form data to check that only positive integers are being entered
   */
  const validateData = useCallback(
    (fieldName: keyof FieldState, value: string) => {
      if (
        // Number must be numeric
        new RegExp(/\D/).test(value)
        // Number must not be less than 0
        || parseInt(value, 10) < 0
      ) {
        setFieldState((state) => ({
          ...state,
          [fieldName]: false,
        }));
      } else {
        setFieldState((state) => ({
          ...state,
          [fieldName]: true,
        }));
      }
    }, [
      setFieldState,
    ]
  );

  /**
   * Indicates whether or not the entire form should be considered valid.
   */
  const formValid = useMemo(() => Object.values(fieldState)
    .every((value) => value === true),
  [fieldState]);

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
    if (formValid) {
      setSaving(true);
      const results = await updateCourseInstance(
        instance.id,
        {
          offered: instance.offered,
          ...sanitizeEnrollmentData(enrollmentData),
        }
      );
      onSave(results);
    }
    setSaving(false);
  };

  /**
   * Called when the modal is closed. If there are any unsaved changes,
   * a warning message appears, and the user must confirm discarding the unsaved
   * changes in order to close the modal. If the user selects cancel, the user
   * can continue making changes in the modal.
   */
  const onModalClose = () => {
    if (changed) {
      // eslint-disable-next-line no-alert
      if (window.confirm('You have unsaved changes. Click \'OK\' to disregard changes, or \'Cancel\' to continue editing.')) {
        setChanged(false);
        onClose();
      }
    } else {
      onClose();
    }
    setFieldState({
      actualEnrollment: true,
      preEnrollment: true,
      studyCardEnrollment: true,
    });
  };

  return (
    <Modal
      ariaLabelledBy="enrollment-modal-header"
      isVisible={isVisible}
      closeHandler={onModalClose}
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
                errorMessage={
                  fieldState[key] ? null : `${name} must be a positive whole number`
                }
                onChange={
                  ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                    validateData(key, value);
                    setChanged(true);
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
      </ModalBody>
      <ModalFooter>
        {
          saving ? null
            : (
              <>
                <Button
                  onClick={saveEnrollmentData}
                  variant={VARIANT.PRIMARY}
                  disabled={!formValid}
                >
                  Save
                </Button>
                <Button
                  onClick={onModalClose}
                  variant={VARIANT.BASE}
                >
                  Cancel
                </Button>
              </>
            )
        }
      </ModalFooter>
    </Modal>
  );
};

export default EnrollmentModal;
