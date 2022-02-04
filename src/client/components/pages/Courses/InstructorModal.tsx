import React, {
  FunctionComponent,
  ReactElement,
  useState,
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
  BorderlessButton,
  List,
  ListItem,
  Combobox,
  ModalMessage,
  LoadSpinner,
} from 'mark-one';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { ComboboxOption } from 'mark-one/lib/Forms/Combobox';
import CourseInstanceResponseDTO from '../../../../common/dto/courses/CourseInstanceResponse';
import { TERM } from '../../../../common/constants';
import { TermKey } from '../../../../common/constants/term';
import { InstructorResponseDTO } from '../../../../common/dto/courses/InstructorResponse.dto';
import { getAllInstructors } from '../../../api/faculty';
import { ManageFacultyResponseDTO } from '../../../../common/dto/faculty/ManageFacultyResponse.dto';
import { updateInstructorList } from '../../../api';

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
  onSave: (
    newInstructorList: InstructorResponseDTO[],
  ) => void;
}

/**
* Sets a min-height double the max-height of the Combobox dropdown, to keep it
* visible when adding instructors
*/
const InstructorModalBody = styled(ModalBody)`
  min-height: 32em;
`;

/**
* Displays a list of the instructors associated with a course instance and
* provides way to add, remove and rearrange them
*/
const InstructorModal: FunctionComponent<InstructorModalProps> = ({
  isVisible,
  currentCourse,
  currentSemester,
  closeModal,
  onSave,
}): ReactElement => {
  const { term, calendarYear } = currentSemester;
  const semKey = term.toLowerCase() as TermKey;
  const {
    catalogNumber,
    [semKey]: {
      id: instanceId,
      instructors: instanceInstructors,
    },
  } = currentCourse;

  /**
   * Keeps track of whether the user has altered fields in the form to determine
   * whether to show a confirmation dialog on modal close
   */
  const [
    isChanged,
    setIsChanged,
  ] = useState(false);

  const confirmMessage = "You have unsaved changes. Click 'OK' to disregard changes, or 'Cancel' to continue editing.";

  /**
   * Used to add the before unload listener in the case that a form field is changed
   */
  useEffect(() => {
    /**
     * Checks to see if there are any unsaved changes in the modal when the user
     * refreshes the page. If there are unsaved changes, the browser displays a
     * warning message to confirm the page reload. If the user selects cancel, the
     * user can continue making changes in the modal.
     */
    const onBeforeUnload = (event: Event) => {
      if (!isChanged) return;
      event.preventDefault();
      // Need to disable this rule for browser compatibility reasons
      // eslint-disable-next-line no-param-reassign
      event.returnValue = false;
      return confirmMessage;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [isChanged]);

  /**
   * Called when the modal is closed. If there are any unsaved changes,
   * a warning message appears, and the user must confirm discarding the unsaved
   * changes in order to close the modal. If the user selects cancel, the user
   * can continue making changes in the modal.
   */
  const confirmAndClose = () => {
    if (isChanged) {
      // eslint-disable-next-line no-alert
      if (window.confirm(confirmMessage)) {
        setIsChanged(false);
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  /**
   * Ref to attach to the internal modal header
   */
  const modalHeaderRef = useRef<HTMLHeadingElement>(null);

  /**
   * Shift the focus to the modal header when it appears on the page
   */
  const setMeetingModalFocus = (): void => {
    setTimeout(() => modalHeaderRef.current?.focus());
  };
  /**
   * Keep a local copy of the course instance instructors that we can modify
   * before committing to the server
   */
  const [
    localInstructors,
    setLocalInstructors,
  ] = useState<{displayName: string, id: string}[]>([]);

  /**
   * Save a complete list of all instructors in local state
   */
  const [
    fullInstructorList,
    setFullInstructorList,
  ] = useState<(ComboboxOption & Partial<ManageFacultyResponseDTO>)[]>([]);

  /**
   * Store any error messages generated inside the modal
   */
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Load the instance instructors into our local state value when the modal
   * opens, then fetch the complete list of instructors from the server
   */
  useEffect(() => {
    if (isVisible) {
      setLocalInstructors(instanceInstructors);
      setMeetingModalFocus();
      getAllInstructors()
        .then((facultyList) => {
          setFullInstructorList(facultyList.map(({
            displayName: label,
            id: value,
          }) => ({
            label,
            value,
          })));
        })
        .catch((error: Error) => {
          setErrorMessage(error.message);
        });
    }
  }, [
    isVisible,
    instanceInstructors,
    setLocalInstructors,
    setFullInstructorList,
  ]);

  /**
   * Swaps an instructor between two positions in the localInstructors array
   * and updates the value of the instructorOrder field to match. If the second
   * value is null, the instructor at the oldIndex will be removed from the
   * list.
   */
  const moveInstructor = (oldIndex: number, newIndex: number): void => {
    setLocalInstructors((list) => {
      const newList = [...list];
      const [thisInstructor] = newList.splice(oldIndex, 1);
      if (newIndex !== null) {
        newList.splice(newIndex, 0, thisInstructor);
      }
      return newList.map((instructor, index) => ({
        ...instructor,
        instructorOrder: index,
      }));
    });
    setIsChanged(true);
  };

  /**
   * Track whether data is being pushed to the server
   */
  const [saving, setSaving] = useState(false);

  /**
   * Submits the updated instructor list to the server and passes the response
   * through to the update handler
   */
  const saveInstructorList = async () => {
    try {
      setSaving(true);
      const results = await updateInstructorList(instanceId, localInstructors);
      onSave(results);
      setIsChanged(false);
    } catch (error) {
      const { message } = error as Error;
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const instanceIdentifier = `${catalogNumber}, ${term} ${calendarYear}`;
  return (
    <Modal
      ariaLabelledBy="edit-instructors-header"
      closeHandler={confirmAndClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        <span id="edit-instructors-header">
          {`Edit Instructors for ${instanceIdentifier}`}
        </span>
      </ModalHeader>
      <InstructorModalBody>
        {saving
          ? (
            <LoadSpinner>Saving Instructors</LoadSpinner>
          )
          : (
            <List>
              <>
                {localInstructors.map(
                  ({ id, displayName }, index, { length }) => (
                    <InstructorListItem key={id}>
                      <BorderlessButton
                        alt={`Remove ${displayName} from ${instanceIdentifier}`}
                        variant={VARIANT.DANGER}
                        onClick={() => {
                          moveInstructor(index, null);
                        }}
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
                          onClick={() => {
                            moveInstructor(index, index - 1);
                          }}
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
                          alt={`Move ${displayName} down to position ${index + 2} in ${instanceIdentifier}`}
                          variant={VARIANT.PRIMARY}
                          onClick={() => {
                            moveInstructor(index, index + 1);
                          }}
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
                  )
                )}
                <ListItem as="div">
                  <Combobox
                    options={fullInstructorList
                      .filter(
                        ({ value }) => (
                          localInstructors
                            .findIndex(
                              ({ id }) => value === id
                            ) === -1)
                      )}
                    label={`Add new Instructor to ${instanceIdentifier}`}
                    currentValue={null}
                    isLabelVisible={false}
                    placeholder={
                      fullInstructorList.length > 0
                        ? 'Add new instructor'
                        : 'Loading instructor data...'
                    }
                    filterFunction={
                      (option, inputValue) => {
                        const inputWords = inputValue.split(' ');
                        const inputRegExp = new RegExp(inputWords.join('|'), 'i');
                        return inputRegExp.test(option.label);
                      }
                    }
                    onOptionSelected={({
                      selectedItem: {
                        label: displayName,
                        value: id,
                      },
                    }) => {
                      setLocalInstructors(
                        (list) => ([...list, { id, displayName }])
                      );
                      setIsChanged(true);
                    }}
                  />
                </ListItem>
              </>
            </List>
          )}
      </InstructorModalBody>
      <ModalFooter>
        <Button
          onClick={saveInstructorList}
          variant={VARIANT.PRIMARY}
          disabled={false}
        >
          Save
        </Button>
        {errorMessage
          ? (
            <ModalMessage variant={VARIANT.NEGATIVE}>
              {errorMessage}
            </ModalMessage>
          ) : null}
        <Button
          onClick={confirmAndClose}
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
