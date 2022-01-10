import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
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

interface ViewModalProps {
  /**
   * True if the modal should be open
   */
  isVisible: boolean;

  /**
   * Handler to be invoked when the modal closes
   */
  onClose: () => void;
}

/**
* Displays the [[SemesterTable]] used for customizing the currently visible
* columns in the [[CourseInstanceTable]]
*/
const ViewModal: FunctionComponent<ViewModalProps> = ({
  isVisible,
  onClose,
  children,
}): ReactElement => {
  /**
   * Ref to attach to the internal modal header
   */
  const modalHeaderRef = useRef<HTMLHeadingElement>(null);

  useEffect((): void => {
    if (isVisible) {
      modalHeaderRef.current.focus();
    }
  }, [isVisible]);

  return (
    <Modal
      ariaLabelledBy="view-modal-header"
      isVisible={isVisible}
      closeHandler={() => {
        onClose();
      }}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        <span id="view-modal-header">
          Customize View
        </span>
      </ModalHeader>
      <ModalBody>
        { children }
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => {
            onClose();
          }}
          variant={VARIANT.BASE}
        >
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewModal;