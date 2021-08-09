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
import { instructorDisplayNameToFirstLast } from '../utils/instructorDisplayNameToFirstLast';
import { MeetingTimesList } from './MeetingTimesList';
import RoomSelection from './RoomSelection';
import RoomRequest from '../../../../common/dto/room/RoomRequest.dto';
import CourseInstanceResponseDTO, { CourseInstanceResponseMeeting } from '../../../../common/dto/courses/CourseInstanceResponse';
import { convert12To24HourTime } from '../../../../common/utils/timeHelperFunctions';

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

  interface LegacyEvent {
    returnValue: string;
  }

  const { term, calendarYear } = currentSemester;
  const semKey = term.toLowerCase() as TermKey;
  const {
    catalogNumber,
    [semKey]: {
      id: instanceId,
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
  ] = useState<CourseInstanceResponseMeeting[]>([]);

  /**
   * Track the current meeting that is being edited within the modal
   */
  const [
    currentEditMeeting,
    setCurrentEditMeeting,
  ] = useState<CourseInstanceResponseMeeting>(null);

  const [saving, setSaving] = useState(false);

  /**
   * State field to set the day and time for which rooms should be shown
   */
  const [
    showRoomsData,
    setShowRoomsData,
  ] = useState<RoomRequest>(null);

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
   * When the modal becomes visible, focus the header, load the current list of
   * meetings, and reset the currentEditMeeting to null
   */
  useEffect(() => {
    if (isVisible) {
      setMeetingModalFocus();
      setAllMeetings(instanceMeetings);
    } else {
      setCurrentEditMeeting(null);
      setShowRoomsData(null);
    }
    /**
     * Checks to see if there are any unsaved changes in the modal when the user
     * refreshes the page. If there are unsaved changes, the browser displays a
     * warning message to confirm the page reload. If the user selects cancel, the
     * user can continue making changes in the modal.
     */
    const onBeforeUnload = (event: Event) => {
      if (!isChanged) return;
      event.preventDefault();
      // It's unclear whether TS will account for browser incompatibility here,
      // so we use all three methods of setting the confirmation message,
      // as detailed here:
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
      const legacyEvent = (event as unknown as LegacyEvent);
      legacyEvent.returnValue = confirmMessage;
      return confirmMessage;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  },
  [
    isVisible,
    setAllMeetings,
    instanceMeetings,
    setCurrentEditMeeting,
    setShowRoomsData,
    isChanged,
  ]);

  /**
   * Called when the modal is closed. If there are any unsaved changes,
   * a warning message appears, and the user must confirm discarding the unsaved
   * changes in order to close the modal. If the user selects cancel, the user
   * can continue making changes in the modal.
   */
  const onModalClose = () => {
    if (isChanged) {
      // eslint-disable-next-line no-alert
      if (window.confirm(confirmMessage)) {
        setIsChanged(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (saving) {
      setSaving(false);
      onSave(/* TODO: pass the data back */);
    }
  }, [saving, onSave]);

  /**
   * The current value of the error message when creating or editing a meeting time
   */
  const [
    meetingTimeError,
    setMeetingTimeError,
  ] = useState('');

  /**
   * Used to create a temporary unique ID for new meetings on the client.
   * A permanent UUID will be assigned as a result of the server request
   */
  const [
    newMeetingIdNumber,
    setNewMeetingIdNumber,
  ] = useState(1);

  /**
   * Updates the generated meeting id for newly created meetingsby increasing
   * the current index by 1
   */
  const updateNewMeetingIdNumber = (): void => {
    setNewMeetingIdNumber(newMeetingIdNumber + 1);
  };

  /**
   * Calls the onChange function to indicate that there has been a change in the
   * meetings of the current modal. If the user exits the modal without saving,
   * there will be a warning message to prevent the user from losing changes.
   */
  const signalModalChange = () => {
    if (!isChanged) {
      setIsChanged(true);
    }
  };

  /**
   * Updates individual fields in the current meeting by merging passed props
   * and values into the object
   */
  const updateCurrentEditMeeting = (
    update: Partial<CourseInstanceResponseMeeting>
  ): void => {
    signalModalChange();
    setCurrentEditMeeting((meeting) => ({
      ...meeting,
      ...update,
    }));
    setShowRoomsData(null);
  };

  /**
   * The fields of the existing meeting are checked to make sure they are non-empty.
   * The entered start and end times are compared to make sure the start time is
   * not later than the end time. In either case, an error is set.
   */
  const validateTimes = (): boolean => {
    if (currentEditMeeting) {
      if (!currentEditMeeting.day
         || !currentEditMeeting.startTime
         || !currentEditMeeting.endTime) {
        setMeetingTimeError('Please provide a day and start/end times before proceeding.');
        return false;
      }
      if (currentEditMeeting.startTime >= currentEditMeeting.endTime) {
        setMeetingTimeError('End time must be later than start time.');
        return false;
      }
    }
    setMeetingTimeError('');
    return true;
  };

  /**
   * Validates the current time information and updates the data for the
   * meeting in our full list, then unsets the current meeting and
   * optionally opens a new one. If the new meeting doesn't already exist in
   * the full list of meetings, it will be added.
   */
  const closeCurrentEditMeeting = (
    newMeeting?: CourseInstanceResponseMeeting
  ) => {
    if (validateTimes()) {
      const updatedMeetings = [...allMeetings];
      if (currentEditMeeting) {
        const editMeetingIndex = updatedMeetings.findIndex(
          ({ id }) => id === currentEditMeeting.id
        );
        if (editMeetingIndex !== -1) {
          updatedMeetings.splice(
            editMeetingIndex,
            1,
            currentEditMeeting
          );
        }
      }
      if (newMeeting) {
        const newMeetingIndex = updatedMeetings.findIndex(
          ({ id }) => id === newMeeting.id
        );
        if (newMeetingIndex === -1) {
          updatedMeetings.push(newMeeting);
        }
        setCurrentEditMeeting(newMeeting);
      } else {
        setCurrentEditMeeting(null);
      }
      setAllMeetings(updatedMeetings);
      setShowRoomsData(null);
    }
  };

  /**
   * Validates the current time information, then sets the time data as the
   * room query
   */
  const searchForRooms = () => {
    if (validateTimes()) {
      let { startTime, endTime } = currentEditMeeting;
      const { day } = currentEditMeeting;
      // TODO: Once we adddress #358 this should not be necessary
      if (/M$/.test(startTime)) {
        startTime = convert12To24HourTime(startTime);
      }
      if (/M$/.test(endTime)) {
        endTime = convert12To24HourTime(endTime);
      }
      setShowRoomsData({
        term,
        calendarYear: calendarYear.toString(),
        startTime,
        endTime,
        day,
        excludeParent: instanceId,
      });
    }
  };

  /**
   * A handler to delete a meeting from the current existing meetings of the
   * course instance. If the deleted meeting was being edited at the time of
   * deletion, the state of the currently edited meeting is set back to null so
   * that no meetings are expanded in edit mode.
   */
  const removeMeeting = (meeting: CourseInstanceResponseMeeting) => {
    if (currentEditMeeting && meeting.id === currentEditMeeting.id) {
      setCurrentEditMeeting(null);
      setShowRoomsData(null);
    }
    signalModalChange();
    const updatedMeetings = allMeetings.filter(
      (currentMeeting) => currentMeeting.id !== meeting.id
    );
    setAllMeetings(updatedMeetings);
  };

  return (
    <Modal
      ariaLabelledBy="editMeeting"
      closeHandler={onModalClose}
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
                allMeetings={allMeetings}
                currentEditMeeting={currentEditMeeting}
                meetingTimeError={meetingTimeError}
                updateCurrentEditMeeting={updateCurrentEditMeeting}
                closeCurrentEditMeeting={closeCurrentEditMeeting}
                showRoomsHandler={searchForRooms}
                newMeetingIdNumber={newMeetingIdNumber.toString()}
                updateNewMeetingIdNumber={updateNewMeetingIdNumber}
                removeMeeting={removeMeeting}
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
                roomHandler={(room) => { updateCurrentEditMeeting({ room }); }}
                currentRoomId={currentEditMeeting?.room?.id}
              />
            </RoomAvailabilityBody>
          </RoomAvailability>
        </MeetingModalBodyGrid>
      </ModalBody>
      <ModalFooter>
        <>
          <Button
            onClick={() => {
              closeCurrentEditMeeting(null);
              setSaving(true);
            }}
            variant={VARIANT.PRIMARY}
          >
            Save
          </Button>
          <Button
            onClick={() => {
              onModalClose();
            }}
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
