import TERM, { TermKey } from 'common/constants/term';
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
  useState,
} from 'react';
import styled from 'styled-components';
import DAY from 'common/constants/day';
import { instructorDisplayNameToFirstLast } from '../utils/instructorDisplayNameToFirstLast';
import { MeetingTimesList } from './MeetingTimesList';
import RoomSelection from './RoomSelection';
import RoomRequest from '../../../../common/dto/room/RoomRequest.dto';
import CourseInstanceResponseDTO, { CourseInstanceResponseMeeting } from '../../../../common/dto/courses/CourseInstanceResponse';

/**
 * A component that applies styling for text that indicates the faculty has
 * no associated notes
 */
const StyledFacultyNote = styled.span`
  font-style: italic;
`;

interface MeetingModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current course instance being edited
   */
  currentCourse: CourseInstanceResponseDTO;
  /**
   * The semester within the current course being edited
   */
  currentSemester: {
    term: TERM,
    calendarYear: number
  };
  /**
   * Handler to be invoked when the modal closes
   */
  onClose: () => void;
  /**
   * Handler to be invoked when the modal is saved
   */
  onSave: () => void;
}

/**
 * Utility component to style content within meeting modal body
 */
const MeetingModalBodyGrid = styled.div`
  max-height: 75vh;
  min-height: 65vh;
  max-width: 75vw;
  min-width: 65vw;
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
  currentCourse,
  currentSemester,
  onSave,
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

  /**
   * State field to set the day and time for which rooms should be shown
   */
  const [
    showRoomsData,
    setShowRoomsData,
  ] = useState<RoomRequest>({
    day: DAY.MON,
    startTime: '13:00:00',
    endTime: '15:00:00',
    term: TERM.FALL,
    calendarYear: '2020',
  });

  const { term, calendarYear } = currentSemester;
  const semKey = term.toLowerCase() as TermKey;
  const {
    catalogNumber,
    [semKey]: {
      meetings: instanceMeetings,
      instructors: instanceInstructors,
    },
  } = currentCourse;

  /**
   * Keeps track of the current meetings for this instance. This is updated as
   * users add and edit meetings in the modal.
   */
  const [
    allMeetings,
    setAllMeetings,
  ] = useState<CourseInstanceResponseMeeting[]>(instanceMeetings);

  /**
   * Track the current meeting that is being edited within the modal
   */
  const [
    currentEditMeeting,
    setCurrentEditMeeting,
  ] = useState<CourseInstanceResponseMeeting>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (saving) {
      setSaving(false);
      onSave(/* TODO: pass the data back */);
    }
  }, [saving, onSave]);

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
        {`Meetings for ${catalogNumber} - ${term} ${calendarYear}`}
      </ModalHeader>
      <ModalBody>
        <MeetingModalBodyGrid>
          <MeetingScheduler>
            <MeetingSchedulerHeader>{`Meeting times for ${catalogNumber}`}</MeetingSchedulerHeader>
            <MeetingSchedulerBody>
              <MeetingTimesList
                saving={saving}
                onChange={(meetings) => setCurrentMeetings(meetings)}
                allMeetings={allMeetings}
                currentEditMeeting={currentEditMeeting}
              />
              <h3>
                Faculty Notes
              </h3>
              <div>
                {instanceInstructors.map((instructor) => (
                  <div key={instructor.displayName}>
                    <h4>
                      {instructorDisplayNameToFirstLast(instructor.displayName)}
                    </h4>
                    <p>
                      {
                        !instructor.notes
                          ? <StyledFacultyNote>No Notes</StyledFacultyNote>
                          : instructor.notes
                      }
                    </p>
                  </div>
                ))}
              </div>
            </MeetingSchedulerBody>
          </MeetingScheduler>
          <RoomAvailability>
            <RoomAvailabilityHeader>Room Availability</RoomAvailabilityHeader>
            <RoomAvailabilityBody>
              <RoomSelection
                roomRequestData={showRoomsData}
                roomHandler={() => {}}
              />
            </RoomAvailabilityBody>
          </RoomAvailability>
        </MeetingModalBodyGrid>
      </ModalBody>
      <ModalFooter>
        <>
          <Button
            onClick={() => {
              setSaving(true);
            }}
            variant={VARIANT.PRIMARY}
          >
            Save
          </Button>
          <Button
            onClick={onClose}
            variant={VARIANT.SECONDARY}
          >
            Cancel
          </Button>
        </>
      </ModalFooter>
    </Modal>
  );
};

export default MeetingModal;
