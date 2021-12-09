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

interface ViewModalProps {
  /**
   * True if the modal should be open
   */
  isVisible: boolean;
}

/**
* Displays a list of the instructors associated with a course instance and
* provides way to add, remove and rearrange them
*/
const ViewModal: FunctionComponent<ViewModalProps> = ({
  isVisible,
}): ReactElement => {
  /**
   * Ref to attach to the internal modal header
   */
  const modalHeaderRef = useRef<HTMLHeadingElement>(null);

  return (
    <Modal
      ariaLabelledBy="view-modal-header"
      isVisible={isVisible}
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
        <p>...</p>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => {}}
          variant={VARIANT.PRIMARY}
          disabled={false}
        >
          Save
        </Button>
        <Button
          onClick={() => {}}
          variant={VARIANT.SECONDARY}
          disabled={false}
        >
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewModal;
