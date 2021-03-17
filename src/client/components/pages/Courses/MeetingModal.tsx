import { CoursesPageCourseInstance } from 'client/context';
import { TermKey } from 'common/constants/term';
import {
  Button,
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
  max-height: 75vh;
  max-width: 75vw;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

/**
 * Contains the meeting scheduler section of the meeting modal
 */
const MeetingScheduler = styled.div`
 display: flex;
 flex-direction: column;
 flex-basis: 48%;
`;

/**
 * The header of the meeting scheduler section of the Meeting Modal
 */
const MeetingSchedulerHeader = styled.h3`
 flex: 0;
`;

/**
 * Contains the MeetingScheduler and RoomAvailability sections of the
 * Meeting Modal
 */
const MeetingSchedulerBody = styled.div`
 flex: 1;
 overflow: auto;
`;

/**
 * Contains the room availability section of the meeting modal
 */
const RoomAvailability = styled.div`
 display: flex;
 flex-direction: column;
 flex-basis: 48%;
`;

/**
 * The header of the room availability section of the Meeting Modal
 */
const RoomAvailabilityHeader = styled.h3`
 flex: 0;
`;

/**
 * Placeholder for the room availability table of the meeting modal for
 * display purposes
 */
const RoomAvailabilityBody = styled.div`
  flex: 1;
  overflow: auto;
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
          <MeetingScheduler>
            <MeetingSchedulerHeader>{`Meeting times for ${course.catalogNumber}`}</MeetingSchedulerHeader>
            <MeetingSchedulerBody />
          </MeetingScheduler>
          <RoomAvailability>
            <RoomAvailabilityHeader>Room Availability</RoomAvailabilityHeader>
            <RoomAvailabilityBody />
          </RoomAvailability>
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