import { CoursesPageCourseInstance } from 'client/context';
import { TermKey } from 'common/constants/term';
import {
  Button,
  fromTheme,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VARIANT,
} from 'mark-one';
import React, {
  FunctionComponent,
  ReactElement,
  Ref,
  useEffect,
  useRef,
} from 'react';
import styled from 'styled-components';

interface MeetingModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current course instance being edited
   */
  currentCourseInstance: CoursesPageCourseInstance;
  /**
   * Handler to be invoked when the modal closes
   */
  onClose: () => void;
}

/**
 * Utility component to style content within meeting modal body
 */
const MeetingModalBodyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
  "meetingScheduler roomAvailability"
  "facultyNotes roomAvailability";
  column-gap: ${fromTheme('ws', 'xsmall')};
`;

/**
 * Placeholder for the meeting scheduler form of the meeting modal for
 * display purposes
 */
const MeetingScheduler = styled.div`
  grid-area: meetingScheduler;
`;

/**
 * Placeholder for the faculty notes section of the meeting modal for
 * display purposes
 */
const FacultyNotes = styled.div`
  grid-area: facultyNotes;
`;

/**
 * Placeholder for the room availability table of the meeting modal for
 * display purposes
 */
const RoomAvailability = styled.div`
  grid-area: roomAvailability;
`;

const MeetingModal: FunctionComponent<MeetingModalProps> = function ({
  isVisible,
  onClose,
  currentCourseInstance,
}): ReactElement {
  /**
   * The current value of the Meeting Modal ref
   */
  const modalHeaderRef: Ref<HTMLHeadingElement> = useRef(null);

  /**
   * Set the ref focus.
   * Since modal may not have been rendered in DOM, wait for it to be
   * rendered by letting next task of event queue run first.
   */
  const setMeetingModalFocus = (): void => {
    setTimeout((): void => modalHeaderRef.current.focus());
  };

  useEffect((): void => {
    setMeetingModalFocus();
  }, []);

  const { course, term } = currentCourseInstance;
  const semKey = term.toLowerCase() as TermKey;
  const instance = course[semKey];

  return (
    <Modal
      ariaLabelledBy="editMeeting"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {`Meetings for ${course.catalogNumber} - ${term} ${instance.calendarYear}`}
      </ModalHeader>
      <ModalBody>
        <MeetingModalBodyGrid>
          <MeetingScheduler>{`Meeting times for ${course.catalogNumber}`}</MeetingScheduler>
          <FacultyNotes>Faculty Notes</FacultyNotes>
          <RoomAvailability>Room Availability</RoomAvailability>
        </MeetingModalBodyGrid>
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

export default MeetingModal;
