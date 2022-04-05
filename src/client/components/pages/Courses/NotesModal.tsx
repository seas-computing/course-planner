import { CourseAPI } from 'client/api';
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

  /**
   * Handler to be invoked when the modal has finished saving it's data. This is
   * particularly useful for persisting the saved data in local state so that a
   * page refresh isn't necessary.
   */
  onSave: (course: CourseInstanceResponseDTO) => void;
}

const NotesModal: FunctionComponent<NotesModalProps> = function ({
  isVisible,
  course,
  onClose,
  onSave,
}): ReactElement {
  const [
    courseNotes,
    setCourseNotes,
  ] = useState(course.notes || '');

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
        <Button
          onClick={async () => {
            await CourseAPI.editCourse({
              id: course.id,
              area: course.area,
              isSEAS: course.isSEAS,
              isUndergraduate: course.isUndergraduate,
              termPattern: course.termPattern,
              title: course.title,
              notes: courseNotes,
            });
            onSave({
              ...course,
              notes: courseNotes,
            });
          }}
          variant={VARIANT.POSITIVE}
        >
          Save
        </Button>
        <Button onClick={onClose} variant={VARIANT.DEFAULT}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default NotesModal;
