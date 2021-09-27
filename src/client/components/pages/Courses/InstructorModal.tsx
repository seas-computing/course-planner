import React, {
  FunctionComponent, ReactElement, useState, useEffect,
} from 'react';
import {
  Modal, ModalHeader, ModalFooter, ModalBody, Button, VARIANT, BorderlessButton, TableCellList, TableCellListItem,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import CourseInstanceResponseDTO from '../../../../common/dto/courses/CourseInstanceResponse';
import { TERM } from '../../../../common/constants';
import { TermKey } from '../../../../common/constants/term';
import { Faculty } from '../../../../server/faculty/faculty.entity';

interface InstructorModalProps {
  isVisible: boolean;
  currentSemester: {
    term: TERM,
    calendarYear: string,
  };
  currentCourse: CourseInstanceResponseDTO
  onClose: () => void;
  onSave: (arg0: Faculty[]) => void;
}

/**
* Displays a list of the instructors associated with a course instance and
* provides way to add, remove and rearrange them
*/
const InstructorModal: FunctionComponent<InstructorModalProps> = ({
  isVisible,
  currentCourse,
  currentSemester,
  onClose,
}): ReactElement => {
  const { term, calendarYear } = currentSemester;
  const semKey = term.toLowerCase() as TermKey;
  const {
    catalogNumber,
    [semKey]: {
      instructors: instanceInstructors,
    },
  } = currentCourse;

  /**
   * Keep a local copy of teh instructors that we can modify before committing
   * to the server
   */
  const [
    allInstructors,
    setAllInstructors,
  ] = useState<{displayName: string, id: string}[]>([]);

  /**
   * Load the instance instructors into our local state value when the modal
   * opens
   */
  useEffect(() => {
    if (isVisible) {
      setAllInstructors(instanceInstructors);
    }
  }, [
    isVisible,
    instanceInstructors,
    setAllInstructors,
  ]);

  return (
    <Modal
      ariaLabelledBy="edit-instructors-header"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader>
        <span id="edit-instructors-header">
          {`Edit Instructors for ${catalogNumber}, ${term} ${calendarYear}`}
        </span>
      </ModalHeader>
      <ModalBody>
        <TableCellList>
          {allInstructors.map(({ id, displayName }, index, { length }) => (
            <TableCellListItem key={id}>
              <BorderlessButton
                variant={VARIANT.DANGER}
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </BorderlessButton>
              {displayName}
              {index > 0 ? (
                <BorderlessButton variant={VARIANT.PRIMARY} onClick={() => {}}>
                  <FontAwesomeIcon icon={faArrowUp} />
                </BorderlessButton>
              ) : null}
              {index < length - 1 ? (
                <BorderlessButton variant={VARIANT.PRIMARY} onClick={() => {}}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </BorderlessButton>
              ) : null}
            </TableCellListItem>
          ))}
        </TableCellList>
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
          onClick={onClose}
          variant={VARIANT.SECONDARY}
          disabled={false}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InstructorModal;
