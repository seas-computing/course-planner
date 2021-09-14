import TERM, { TermKey } from 'common/constants/term';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VARIANT,
  LoadSpinner,
  fromTheme,
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
import axios from 'axios';
import { instructorDisplayNameToFirstLast } from '../utils/instructorDisplayNameToFirstLast';
import { MeetingTimesList } from './MeetingTimesList';
import RoomSelection from './RoomSelection';
import RoomRequest from '../../../../common/dto/room/RoomRequest.dto';
import CourseInstanceResponseDTO, { CourseInstanceResponseMeeting } from '../../../../common/dto/courses/CourseInstanceResponse';
import { convert12To24HourTime } from '../../../../common/utils/timeHelperFunctions';
import { updateMeetingList } from '../../../api';
import { MeetingRequestDTO } from '../../../../common/dto/meeting/MeetingRequest.dto';
import { MeetingResponseDTO } from '../../../../common/dto/meeting/MeetingResponse.dto';

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
    calendarYear: string
  };
  /**
   * Handler to be invoked when the modal closes
   */
  onClose: () => void;
  /**
   * Handler to be invoked when the modal is saved
   */
  onSave: (arg0: MeetingResponseDTO[]) => void;
}

/**
 * Utility component to style content within meeting modal body
 */
const MeetingModalBodyGrid = styled.div<{showError: boolean}>`
  width: 75vw;
  height: 75vh;
  display: grid;
  grid-template-areas:
    "meet room"
    "note room"
    "err err"
  ;
  grid-template-rows: ${({ showError }) => (showError
    ? 'auto 1fr min-content'
    : 'auto 1fr 0')};
  grid-template-columns: 1fr 1fr;
  grid-column-gap: ${fromTheme('ws', 'xlarge')};
`;

/**
 * Contains the meeting scheduler section of the meeting modal
 */
const MeetingScheduler = styled.div`
 display: flex;
 flex-direction: column;
 grid-area: meet;
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
 grid-area: room;
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
  overflow-y: auto;
`;

const NotesSection = styled.div`
  grid-area: note;
`;

const ErrorSection = styled.div`
  grid-area: err;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
`;

const ErrorMessage = styled.p`
  font-family: ${fromTheme('font', 'bold', 'family')};
  font-size: ${fromTheme('font', 'bold', 'size')};
  font-weight: ${fromTheme('font', 'bold', 'weight')};
  color: ${fromTheme('color', 'text', 'negative')};
  text-align: center;
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
    setTimeout((): void => modalHeaderRef.current?.focus());
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

  /**
   * Flag for when data is being saved to the server
   */
  const [saving, setSaving] = useState(false);

  /**
   * Holds any errors returned by the server
   */
  const [saveError, setSaveError] = useState('');

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

  /**
   * Indicates whether the meetings have been initially set in the modal.
   * This prevents the meetings from being loaded every time useEffect is run.
   */
  const [initialized, setInitialized] = useState(false);

  const confirmMessage = "You have unsaved changes. Click 'OK' to disregard changes, or 'Cancel' to continue editing.";

  /**
   * When the modal becomes visible, focus the header, load the current list of
   * meetings, and reset the currentEditMeeting to null
   */
  useEffect(() => {
    if (isVisible) {
      setSaveError('');
      setMeetingModalFocus();
      if (!initialized) {
        setAllMeetings(instanceMeetings);
        setInitialized(true);
      }
    } else {
      setCurrentEditMeeting(null);
      setShowRoomsData(null);
      setInitialized(false);
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
    initialized,
    setInitialized,
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
    setSaveError('');
    if (!saving) {
      signalModalChange();
      setCurrentEditMeeting((meeting) => ({
        ...meeting,
        ...update,
      }));
      setShowRoomsData(null);
    }
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
  * Merge the currentEditMeeting into allMeetings, returning the updated list.
  */

  const mergeMeetings = () => {
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
    return updatedMeetings;
  };

  /**
   * Validates the current time information and updates the data for the
   * meeting in our full list, then unsets the current meeting and
   * optionally opens a new one. If the new meeting doesn't already exist in
   * the full list of meetings, it will be added.
   */
  const toggleCurrentEditMeeting = (
    newMeeting?: CourseInstanceResponseMeeting
  ) => {
    if (validateTimes()) {
      const updatedMeetings = mergeMeetings();
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
    if (!saving && validateTimes()) {
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
        calendarYear,
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
    if (!saving) {
      signalModalChange();
      if (currentEditMeeting && meeting.id === currentEditMeeting.id) {
        setCurrentEditMeeting(null);
        setShowRoomsData(null);
      }
      const updatedMeetings = allMeetings.filter(
        (currentMeeting) => currentMeeting.id !== meeting.id
      );
      setAllMeetings(updatedMeetings);
    }
  };

  /**
   * Handles submitting the updated list of meeting to the server, and passing
   * the resulting saved list on to the `onSave` handler provided by the
   * parent.
   */
  const saveMeetingData = async () => {
    if (validateTimes()) {
      toggleCurrentEditMeeting();
      setSaveError('');
      setSaving(true);
      const updatesToSend = mergeMeetings()
        .map(({ id, room, ...meeting }) => {
          const update: MeetingRequestDTO = {
            ...meeting,
            roomId: room?.id,
          };
          if (id.startsWith('new-meeting')) {
            return update;
          }
          return { id, ...update };
        });
      let savedMeetings: MeetingResponseDTO[];
      try {
        savedMeetings = await updateMeetingList(
          instanceId,
          updatesToSend
        );
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const serverError = err.response.data as Error;
          setSaveError(serverError.message);
        } else if (savedMeetings === undefined) {
          const errorMessage = (err as Error).message;
          setSaveError(`Failed to save meeting data. Please try again later.
          ${errorMessage}`);
        }
      } finally {
        setSaving(false);
      }
      if (savedMeetings) {
        onSave(savedMeetings);
        onClose();
      }
    }
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
        <MeetingModalBodyGrid showError={!!saveError || saving}>
          <MeetingScheduler>
            <MeetingSchedulerHeader>{`Meeting times for ${catalogNumber}`}</MeetingSchedulerHeader>
            <MeetingSchedulerBody>
              <MeetingTimesList
                allMeetings={allMeetings}
                currentEditMeeting={currentEditMeeting}
                meetingTimeError={meetingTimeError}
                updateCurrentEditMeeting={updateCurrentEditMeeting}
                toggleCurrentEditMeeting={toggleCurrentEditMeeting}
                showRoomsHandler={searchForRooms}
                newMeetingIdNumber={newMeetingIdNumber.toString()}
                updateNewMeetingIdNumber={updateNewMeetingIdNumber}
                removeMeeting={removeMeeting}
              />
            </MeetingSchedulerBody>
          </MeetingScheduler>
          <NotesSection>
            <h3>
              Faculty Notes
            </h3>
            <div>
              {instanceInstructors.map((instructor) => (
                <div key={instructor.displayName}>
                  <h4>
                    {instructorDisplayNameToFirstLast(
                      instructor.displayName
                    )}
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
          </NotesSection>
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
          <ErrorSection>
            {saving && <LoadSpinner>Saving Meetings</LoadSpinner>}
            {!!saveError && (
              <ErrorMessage
                role="alert"
                aria-live="assertive"
              >
                {saveError}
              </ErrorMessage>
            )}
          </ErrorSection>
        </MeetingModalBodyGrid>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={saveMeetingData}
          variant={VARIANT.PRIMARY}
          disabled={saving}
        >
          Save
        </Button>
        <Button
          onClick={onClose}
          variant={VARIANT.SECONDARY}
          disabled={saving}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MeetingModal;
