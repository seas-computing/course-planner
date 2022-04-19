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
  Ref,
  useEffect,
  useRef,
  useState,
} from 'react';
import CourseInstanceResponseDTO from '../../../../common/dto/courses/CourseInstanceResponse';

interface NotesModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;

  /**
   * The course the modal is editing notes for
   */
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
  /**
   * Current state value of course notes
   */
  const [
    courseNotes,
    setCourseNotes,
  ] = useState('');

  /**
   * The current value of the Meeting Modal ref
   */
  const modalHeaderRef: Ref<HTMLHeadingElement> = useRef(null);

  /**
   * Sets the ref focus.
   * Since modal may not have been rendered in DOM, wait for it to be
   * rendered by letting next task of event queue run first.
   */
  useEffect(() => {
    setTimeout((): void => modalHeaderRef.current?.focus());
  }, [modalHeaderRef]);

  /**
   * Set initial value of local courseNotes state field. 
   */
  useEffect(() => {
    setCourseNotes(course?.notes);
  }, [course, setCourseNotes]);

  return (
    <Modal
      ariaLabelledBy="notes"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {`Notes For ${course?.catalogNumber}`}
      </ModalHeader>
      <ModalBody>
        <MultiLineTextInput
          id={`notes-${course?.id}`}
          value={courseNotes}
          label="Course Notes"
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
