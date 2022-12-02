import React, {
  FunctionComponent,
  ReactElement,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  Ref,
} from 'react';
import {
  VARIANT,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  ValidationErrorMessage,
  NoteText,
  TextInput,
  POSITION,
  Form,
} from 'mark-one';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import ValidationException from 'common/errors/ValidationException';
import { AxiosError } from 'axios';
import { LocationAPI } from 'client/api';
import { ServerErrorInfo } from '../Courses/CourseModal';

interface EditRoomModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current room being edited.
   */
  currentRoom: RoomAdminResponse;
  /**
   * Handler to be invoked when the edit is successful
   */
  onSuccess: () => void;
  /**
   * Handler to be invoked when the modal is closed
   */
  onClose: () => void;
}

interface FormErrors {
  roomName: string;
  capacity: string;
}

/**
 * This component represents the Edit Room modal, which will be used to update
 * the room name and capacity for existing rooms.
 */
const EditRoomModal:
FunctionComponent<EditRoomModalProps> = ({
  isVisible,
  currentRoom,
  onSuccess,
  onClose,
}): ReactElement => {
  /**
   * Keeps track of the values of the edit room modal form fields
   */
  const [form, setFormFields] = useState({
    roomName: '',
    capacity: '',
  });

  /**
   * Keeps track of whether the user has altered fields in the form to determine
   * whether to show a confirmation dialog on modal close
   */
  const [
    isChanged,
    setIsChanged,
  ] = useState(false);

  const confirmMessage = "You have unsaved changes. Click 'OK' to disregard changes, or 'Cancel' to continue editing.";

  const updateFormFields = (event: ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    setFormFields({
      ...form,
      [target.name]:
      target.value,
    });
    setIsChanged(true);
  };

  /**
   * The current error messages for fields in the Create Room modal
   */
  const [formErrors, setFormErrors] = useState({
    roomName: '',
    capacity: '',
  } as FormErrors);

  /**
   * The overall error message for the Create Room Modal
   */
  const [
    roomModalErrorMessage,
    setRoomModalErrorMessage,
  ] = useState('');

  /**
   * The current value of the Create Room Modal ref
   */
  const modalHeaderRef: Ref<HTMLHeadingElement> = useRef(null);

  /**
   * Set the ref focus.
   * Since modal may not have been rendered in DOM, wait for it to be
   * rendered by letting next task of event queue run first.
   */
  const setRoomAdminModalFocus = (): void => {
    setTimeout((): void => modalHeaderRef.current.focus());
  };

  /**
   * Submits the edit room form, checking for valid inputs
   */
  const submitRoomForm = async ():
  Promise<RoomAdminResponse> => {
    let isValid = true;
    let updatedFormErrors = {
      roomName: '',
      capacity: '',
    };
    setFormErrors(updatedFormErrors);
    if (!form.roomName) {
      updatedFormErrors = {
        ...updatedFormErrors,
        roomName: 'Room number is required to submit this form.',
      };
      isValid = false;
    }
    if (!/^\d+$/.test(form.capacity)) {
      updatedFormErrors = {
        ...updatedFormErrors,
        capacity: 'Capacity is required to submit this form, and it must be a number.',
      };
      isValid = false;
    }
    if (!isValid) {
      setFormErrors(updatedFormErrors);
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }

    const result: RoomAdminResponse = await LocationAPI.editRoom({
      id: currentRoom.id,
      name: form.roomName,
      capacity: parseInt(form.capacity, 10),
    });

    return result;
  };

  // Ensure any previous field values and errors are cleared when opening
  // the Create Room modal.
  useEffect(() => {
    if (isVisible) {
      setFormFields({
        roomName: currentRoom.name,
        capacity: currentRoom.capacity.toString(),
      });
      setFormErrors({
        roomName: '',
        capacity: '',
      });
      setRoomModalErrorMessage('');
      setRoomAdminModalFocus();
    }
  }, [isVisible, currentRoom]);

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

  return (
    <Modal
      ariaLabelledBy="editRoom"
      closeHandler={onModalClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {`Edit room ${currentRoom.building.name} ${currentRoom.name}`}
      </ModalHeader>
      <ModalBody>
        <NoteText>Note: * denotes a required field</NoteText>
        <Form
          id="editRoomForm"
          label="Edit Room Form"
        >
          <TextInput
            id="campus"
            name="campus"
            label="Campus"
            labelPosition={POSITION.TOP}
            value={currentRoom.building.campus.name}
            onChange={() => {}}
            disabled
            isRequired
          />
          <TextInput
            id="building"
            name="building"
            label="Building"
            labelPosition={POSITION.TOP}
            value={currentRoom.building.name}
            onChange={() => {}}
            disabled
            isRequired
          />
          <TextInput
            id="roomName"
            name="roomName"
            label="Room Number"
            labelPosition={POSITION.TOP}
            value={form.roomName}
            errorMessage={formErrors.roomName}
            onChange={updateFormFields}
            isRequired
          />
          <TextInput
            id="capacity"
            name="capacity"
            label="Capacity"
            labelPosition={POSITION.TOP}
            value={form.capacity.toString()}
            errorMessage={formErrors.capacity}
            onChange={updateFormFields}
            isRequired
          />
          {roomModalErrorMessage && (
            <ValidationErrorMessage
              id="createRoomModalErrorMessage"
            >
              {roomModalErrorMessage}
            </ValidationErrorMessage>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="editRoomSubmit"
          onClick={async (): Promise<void> => {
            try {
              await submitRoomForm();
              onSuccess();
            } catch (error) {
              if ((error as AxiosError).response) {
                const serverError = error as AxiosError;
                const { response } = serverError;
                if (response.data
                  && (response.data as ServerErrorInfo).message) {
                  setRoomModalErrorMessage(
                    String((response.data as ServerErrorInfo).message)
                  );
                }
              } else {
                setRoomModalErrorMessage('An error occurred. Please contact SEAS Computing if the problem persists.');
              }
              return;
            }
            setIsChanged(false);
            onClose();
          }}
          variant={VARIANT.PRIMARY}
        >
          Submit
        </Button>
        <Button
          onClick={onModalClose}
          variant={VARIANT.SECONDARY}
        >
          Cancel
        </Button>
      </ModalFooter>

    </Modal>
  );
};

export default EditRoomModal;
