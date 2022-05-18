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
} from 'mark-one';
import CourseInstanceResponseDTO, { Instance } from 'common/dto/courses/CourseInstanceResponse';
import { TERM } from 'common/constants';
import { TermKey } from 'common/constants/term';
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
   * Effect hook to create state fields for each form field
   */
  useEffect(() => {
    if (course && isVisible) {
      const semKey = currentSemester.term.toLowerCase() as TermKey;
      const {
        [semKey]: instance,
      } = course;
      setEnrollmentData({
        preEnrollment: instance.preEnrollment,
        actualEnrollment: instance.actualEnrollment,
        studyCardEnrollment: instance.studyCardEnrollment,
      });
    }
  }, [setEnrollmentData, currentSemester.term, course, isVisible]);

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
        }
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => {
            console.log('You clicked me!');
          }}
          variant={VARIANT.PRIMARY}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EnrollmentModal;
