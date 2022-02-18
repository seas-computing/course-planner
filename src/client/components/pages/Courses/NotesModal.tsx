import {
  Modal, ModalBody, ModalHeader,
} from 'mark-one';
import React, { FunctionComponent, ReactElement } from 'react';
import CourseInstanceResponseDTO from '../../../../common/dto/courses/CourseInstanceResponse';

interface NotesModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;

  course: CourseInstanceResponseDTO;
}

const NotesModal: FunctionComponent<NotesModalProps> = function ({
  isVisible,
  course,
}): ReactElement {
  return (
    <Modal
      ariaLabelledBy="notes"
      closeHandler={() => {}}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={null}
        tabIndex={0}
      >
        {`Notes For ${course.catalogNumber}`}
      </ModalHeader>
      <ModalBody>
        { course.notes }
      </ModalBody>
    </Modal>
  );
};

export default NotesModal;
