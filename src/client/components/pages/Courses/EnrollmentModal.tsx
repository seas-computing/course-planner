import React, {
  FunctionComponent,
  ReactElement,
  useRef,
} from 'react';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VARIANT,
} from 'mark-one';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { TERM } from 'common/constants';

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

  const {
    catalogNumber,
  } = course;

  const term = currentSemester.term[0].toUpperCase()
    + currentSemester.term.slice(1).toLowerCase();

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
          {`Enrollment For ${catalogNumber} for ${term} ${currentSemester.calendarYear}`}
        </span>
      </ModalHeader>
      <ModalBody>
        <p>
          Modal Content Here
        </p>
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
