import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VARIANT,
} from 'mark-one';
import { COURSE_TABLE_COLUMN } from 'common/constants';
import SemesterTable from './SemesterTable';
import { modalFields } from './modalFields';

interface ViewModalProps {
  /**
   * True if the modal should be open
   */
  isVisible: boolean;

  /**
   * Handler to be invoked when the modal closes
   */
  onClose: (columns: COURSE_TABLE_COLUMN[]) => void;

  /**
   * The columns selected by the user when the modal opens
   */
  currentViewColumns: COURSE_TABLE_COLUMN[];
}

/**
* Displays the [[SemesterTable]] used for customizing the currently visible
* columns in the [[CourseInstanceTable]]
*/
const ViewModal: FunctionComponent<ViewModalProps> = ({
  isVisible,
  onClose,
  currentViewColumns,
}): ReactElement => {
  /**
   * Ref to attach to the internal modal header
   */
  const modalHeaderRef = useRef<HTMLHeadingElement>(null);

  /**
   * Track the internal set of columns that have been checked by the user
   */
  const [
    checkedColumns,
    setCheckedColumns,
  ] = useState<COURSE_TABLE_COLUMN[]>([]);

  /**
   * Show/hide columns from the course instance table
   *
   * @param viewColumn The column that triggered the change handler
   */
  const toggleColumn = useCallback((viewColumn: COURSE_TABLE_COLUMN): void => {
    setCheckedColumns((columns: COURSE_TABLE_COLUMN[]) => {
      if (columns.includes(viewColumn)) {
        return columns.filter((col) => col !== viewColumn);
      }
      return columns.concat([viewColumn]);
    });
  }, [setCheckedColumns]);

  /**
   * Focus the header on initial load
   */
  useEffect((): void => {
    if (isVisible) {
      modalHeaderRef.current.focus();
      setCheckedColumns(currentViewColumns);
    }
  }, [isVisible, currentViewColumns]);

  return (
    <Modal
      ariaLabelledBy="view-modal-header"
      isVisible={isVisible}
      closeHandler={() => { onClose(checkedColumns); }}
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
        <SemesterTable
          columns={modalFields}
          checked={checkedColumns}
          onChange={toggleColumn}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => { onClose(checkedColumns); }}
          variant={VARIANT.BASE}
        >
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewModal;
