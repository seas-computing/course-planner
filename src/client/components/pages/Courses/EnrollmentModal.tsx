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
   * Map containing key-value pairs of various enrollment fields and their
   * count. This is used to store the value used for field updates.
   */
  const [
    enrollmentData,
    setEnrollmentData,
  ] = useState<Pick<Instance, 'preEnrollment'|'actualEnrollment'|'studyCardEnrollment'>>();

  /**
   * Shows and hides the loading spinner while saving enrollment data
   */
  const [
    saving,
    setSaving,
  ] = useState(false);

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
        preEnrollment: instance?.preEnrollment,
        actualEnrollment: instance?.actualEnrollment,
        studyCardEnrollment: instance?.studyCardEnrollment,
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
   * Submits the updated enrollment data to the server and passes the response
   * through to the update handler
   */
  const saveEnrollmentData = async () => {
    setSaving(true);
    const results = await updateCourseInstance(
      instance.id,
      {
        offered: instance.offered,
        ...enrollmentData,
      }
    );
    onSave(results);
    setSaving(false);
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
                      [key]: parseInt(value, 10) ?? null,
                    }));
                  }
                }
              />
            ))
          )
        }
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={saveEnrollmentData}
          variant={VARIANT.PRIMARY}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EnrollmentModal;
