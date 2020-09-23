import React, {
  FunctionComponent,
  ReactElement,
  Ref,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NoteText,
  VARIANT,
} from 'mark-one';
import { MetadataContext } from 'client/context/MetadataContext';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';

interface CourseModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current course being edited, or undefined if creating a new course.
   */
  currentCourse?: ManageCourseResponseDTO;
  /**
   * Handler to be invoked when the modal closes
   * e.g. to clear data entered into a form
   */
  onClose?: () => void;
  /**
   * Handler to be invoked when the edit is successful
   */
  onSuccess?: (faculty: ManageCourseResponseDTO) => Promise<void>;
}

/**
 * This component represents the create and edit course modals, which will be
 * used on the Course Admin page
 */
const CourseModal: FunctionComponent<CourseModalProps> = function ({
  isVisible,
  currentCourse,
  onSuccess,
  onClose,
}): ReactElement {
  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

  /**
   * The current value of the Create Course Modal ref
   */
  const modalHeaderRef: Ref<HTMLHeadingElement> = useRef(null);

  /**
   * Set the ref focus.
   * Since modal may not have been rendered in DOM, wait for it to be
   * rendered by letting next task of event queue run first.
   */
  const setCourseModalFocus = (): void => {
    setTimeout((): void => modalHeaderRef.current.focus());
  };

  useEffect((): void => {
    if (isVisible) {
      setCourseModalFocus();
    }
  }, [isVisible]);

  return (
    <Modal
      ariaLabelledBy="editCourse"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {currentCourse ? 'Edit Course' : 'Create New Course'}
      </ModalHeader>
      <ModalBody>
        <NoteText>Note: * denotes a required field</NoteText>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={onClose}
          variant={VARIANT.SECONDARY}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CourseModal;
