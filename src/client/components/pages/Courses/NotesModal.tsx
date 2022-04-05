import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  MultiLineTextInput,
  POSITION,
  VARIANT,
} from 'mark-one';
import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  useState,
} from 'react';
import CourseInstanceResponseDTO from '../../../../common/dto/courses/CourseInstanceResponse';

interface NotesModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;

  course: CourseInstanceResponseDTO;

  /**
   * Handler to be invoked when the modal closes
   */
  onClose: () => void;
}

const NotesModal: FunctionComponent<NotesModalProps> = function ({
  isVisible,
  course,
  onClose,
}): ReactElement {
  return (
    <Modal
      ariaLabelledBy="notes"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={null}
        tabIndex={0}
      >
        {`Notes For ${course.catalogNumber}`}
      </ModalHeader>
      <ModalBody>
        <MultiLineTextInput
          id={`notes-${course.id}`}
          value={courseNotes}
          label={`Notes For ${course.catalogNumber}`}
          name="notes"
          placeholder="Some course notes"
          isLabelVisible={false}
          labelPosition={POSITION.TOP}
          onChange={
            ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
              setCourseNotes(value);
            }
          }
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} variant={VARIANT.DEFAULT}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default NotesModal;
