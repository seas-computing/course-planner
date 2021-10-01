import React, {
  FunctionComponent, ReactElement, useState, useEffect,
} from 'react';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VARIANT,
  BorderlessButton,
  List,
  ListItem,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import CourseInstanceResponseDTO from '../../../../common/dto/courses/CourseInstanceResponse';
import { TERM } from '../../../../common/constants';
import { TermKey } from '../../../../common/constants/term';
import { InstructorResponseDTO } from '../../../../common/dto/courses/InstructorResponse.dto';

/**
* Implement flexbox inside our ListItem to handle row spacing for handling
* spacing inside the instructor list entries
*/
const InstructorListItem = styled(ListItem)`
  display: flex;
  justify-content: start;
  align-items: baseline;
  & .instructor-name {
    flex-grow: 1;
  }
`;

interface InstructorModalProps {
  /**
   * True if the modal should be open
   */
  isVisible: boolean;
  /*
   * Information about the semester associated with the instance that is being
   * edited
   */
  currentSemester: {
    term: TERM,
    calendarYear: string,
  };
  /**
   * Full details of the course/instances whose instructors are being edited
   */
  currentCourse: CourseInstanceResponseDTO
  /**
   * A function that will close the modal when called
   */
  closeModal: () => void;
  /**
   * A hook that will be called with the result of saving the instructor list
   * to the server
   */
  onSave: (arg0: InstructorResponseDTO[]) => void;
}

/**
* Displays a list of the instructors associated with a course instance and
* provides way to add, remove and rearrange them
*/
const InstructorModal: FunctionComponent<InstructorModalProps> = ({
  isVisible,
  currentCourse,
  currentSemester,
  closeModal,
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
   * Keep a local copy of the instructors that we can modify before committing
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

  const instanceIdentifier = `${catalogNumber}, ${term} ${calendarYear}`;
  return (
    <Modal
      ariaLabelledBy="edit-instructors-header"
      closeHandler={closeModal}
      isVisible={isVisible}
    >
      <ModalHeader>
        <span id="edit-instructors-header">
          {`Edit Instructors for ${instanceIdentifier}`}
        </span>
      </ModalHeader>
      <ModalBody>
        <List>
          {allInstructors.map(({ id, displayName }, index, { length }) => (
            <InstructorListItem key={id}>
              <BorderlessButton
                alt={`Remove ${displayName} from ${instanceIdentifier}`}
                variant={VARIANT.DANGER}
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </BorderlessButton>
              <span className="instructor-name" id={`instructor-${index + 1}`}>
                {displayName}
              </span>
              {index > 0 ? (
                <BorderlessButton
                  alt={`Move ${displayName} up to position ${index} in ${instanceIdentifier}`}
                  variant={VARIANT.PRIMARY}
                  onClick={() => {}}
                >
                  <FontAwesomeIcon icon={faArrowUp} />
                </BorderlessButton>
              ) : (
                <BorderlessButton
                  disabled
                  alt={`${displayName} cannot be moved up`}
                  variant={VARIANT.DEFAULT}
                  onClick={() => {}}
                >
                  <FontAwesomeIcon icon={faArrowUp} />
                </BorderlessButton>
              )}
              {index < length - 1 ? (
                <BorderlessButton
                  alt={`Move ${displayName} down to Position ${index + 2} in ${instanceIdentifier}`}
                  variant={VARIANT.PRIMARY}
                  onClick={() => {}}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </BorderlessButton>
              ) : (
                <BorderlessButton
                  disabled
                  alt={`${displayName} cannot be moved down`}
                  variant={VARIANT.DEFAULT}
                  onClick={() => {}}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </BorderlessButton>
              )}
            </InstructorListItem>
          ))}
        </List>
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
          onClick={closeModal}
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
