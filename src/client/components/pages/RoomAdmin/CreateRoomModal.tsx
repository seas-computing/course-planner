import React, {
  FunctionComponent,
  ReactElement,
  useContext,
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
  Dropdown,
  Fieldset,
  TextInput,
  ValidationErrorMessage,
  NoteText,
  POSITION,
  Form,
  RadioButton,
} from 'mark-one';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import { MetadataContext } from 'client/context';
import ValidationException from 'common/errors/ValidationException';
import { LocationAPI } from 'client/api';
import { CampusResponse } from 'common/dto/room/CampusResponse.dto';

interface CreateRoomModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * Handler to be invoked when the modal closes
   * e.g. to clear data entered into a form
   */
  onClose: () => void;
  /**
   * Handler to be invoked when the creation is successful
   */
  onSuccess: (room:RoomAdminResponse) => void;
}

interface FormErrors {
  campus: string;
  building: string;
  roomName: string;
  capacity: string;
}

const displayNames: Record<string, string> = {
  existingCampus: 'Existing Campus',
  newCampus: 'New Campus',
  existingBuilding: 'Existing Building',
  newBuilding: 'New Building',
  roomName: 'Room Number',
  capacity: 'Capacity',
};

const CreateRoomModal: FunctionComponent<CreateRoomModalProps> = function ({
  isVisible,
  onClose,
  onSuccess,
}): ReactElement {
  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

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
   * Keeps track of the values of the admin modal form fields
   */
  const [form, setFormFields] = useState({
    campusType: 'existingCampus',
    existingCampus: '',
    newCampus: '',
    buildingType: 'existingBuilding',
    existingBuilding: '',
    newBuilding: '',
    roomName: '',
    capacity: '',
  });

  type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const updateFormFields = (event: ChangeEvent): void => {
    const target = event.target as FormField;
    setFormFields({
      ...form,
      [target.name]:
      target.value,
    });
    setIsChanged(true);
  };

  /**
   * The current value of the error message for the campus field
   */
  const [
    campusError,
    setCampusError,
  ] = useState('');

  /**
   * The current value of the error message for the building field
   */
   const [
    buildingError,
    setBuildingError,
  ] = useState('');

  /**
   * The current value of the error message for the room name field
   */
   const [
    roomNameError,
    setRoomNameError,
  ] = useState('');

  /**
   * The current value of the error message for the capacity field
   */
   const [
    capacityError,
    setCapacityError,
  ] = useState('');

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
   * Submits the room form, checking for valid inputs
   */
  const submitRoomForm = async ():
  Promise<RoomAdminResponse> => {
    let isValid = true;
    // Either an existing or new campus must be provided.
    if (!form.existingCampus && !form.newCampus) {
      setCampusError('Campus is required to submit this form.');
      isValid = false;
    }
    // Either an existing or new building must be provided.
    if (!form.existingBuilding && !form.newBuilding) {
      setBuildingError('Building is required to submit this form.');
      isValid = false;
    }
    if (!form.roomName) {
      setRoomNameError('Room number is required to submit this form.')
      isValid = false;
    }
    if (!form.capacity && Number.isNaN(parseInt(form.capacity, 10))) {
      setCapacityError('Capacity is required to submit this form, and it must be a number.');
      isValid = false;
    }
    if (!isValid) {
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }
    // If the user is trying to create a room with an existing campus, use the
    // existing campus form field value instead of the new campus form field value.
    const campus = form.campusType === 'existingCampus'
      ? form.existingCampus
      : form.newCampus;

    // If the user is trying to create a room with an existing building, use the
    // existing building form field value instead of the new building form field value.
    const building = form.buildingType === 'existingBuilding'
      ? form.existingBuilding
      : form.newBuilding;

    const roomInfo = {
      campus,
      building,
      name: form.roomName,
      capacity: parseInt(form.capacity, 10),
    };

    const result: RoomAdminResponse = await LocationAPI.createRoom(roomInfo);

    // ** TODO: Update campuses metadata after the user has created a new room **

    return result;
  };

  // Ensure any previous field values and errors are cleared when opening
  // the Create Room modal.
  useEffect(() => {
    if (isVisible) {
      setFormFields({
        campusType: 'existingCampus',
        existingCampus: '',
        newCampus: '',
        buildingType: 'existingBuilding',
        existingBuilding: '',
        newBuilding: '',
        roomName: '',
        capacity: '',
      });
      setCampusError('');
      setBuildingError('');
      setRoomNameError('');
      setCapacityError('');
      setRoomModalErrorMessage('');
      setRoomModalErrorMessage('');
      setRoomAdminModalFocus();
    }
  }, [isVisible]);

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
   * Gets a list of campuses from the metadata.
   * Insert an empty option so that no campus is pre-selected in dropdown.
   */
  const campusOptions = [{ value: '', label: '' }]
    .concat(metadata.campuses.map((campus): {
      value: string;label: string;
    } => ({
      value: campus.name,
      label: campus.name,
    })));

  /**
   * Gets a list of buildings from the metadata for a specific campus.
   * Insert an empty option so that no building is pre-selected in dropdown.
   */
  const findCampusBuildings = (selectedCampus: string) => {
    const campus: CampusResponse = metadata.campuses
      .find(campus => selectedCampus === campus.name);
    const campusBuildings = campus.buildings
      .map(building => building.name);
    return [{ value: '', label: '' }]
    .concat(campusBuildings.map((building): {
      value: string; label: string;
    } => ({
      value: building,
      label: building
    })))
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
        Create New Room
      </ModalHeader>
      <ModalBody>
        <NoteText>Note: * denotes a required field</NoteText>
        <Form
          id="createRoomForm"
          label="Create Room Form"
        >
          <Fieldset
            legend="Campus"
            isBorderVisible
            isLegendVisible
            errorMessage={campusError}
            isRequired
          >
            <RadioButton
              label="Select an existing campus"
              value="existingCampus"
              name="campusType"
              checked={form.campusType === 'existingCampus'}
              onChange={updateFormFields}
            />
            <Dropdown
              id="existingCampus"
              value={form.existingCampus}
              name="existingCampus"
              onChange={updateFormFields}
              onClick={(e): void => {
                e.preventDefault();
                setFormFields({
                  ...form,
                  campusType: 'existingCampus',
                });
              }}
              label={displayNames.existingCampus}
              isLabelVisible={false}
              options={campusOptions}
            />
            <RadioButton
              label="Create a new campus"
              value="createCampus"
              name="campusType"
              checked={form.campusType === 'createCampus'}
              onChange={updateFormFields}
            />
            <TextInput
              id="newCampus"
              value={form.newCampus}
              name="newCampus"
              onChange={updateFormFields}
              onClick={(): void => setFormFields({
                ...form,
                campusType: 'createCampus',
              })}
              label={displayNames.newCampus}
              isLabelVisible={false}
              labelPosition={POSITION.TOP}
            />
          </Fieldset>
          <Fieldset
            legend="Building"
            isBorderVisible
            isLegendVisible
            errorMessage={buildingError}
            isRequired
          >
            <RadioButton
              label="Select an existing building"
              value="existingBuilding"
              name="buildingType"
              checked={form.buildingType === 'existingBuilding'}
              onChange={updateFormFields}
            />
            <Dropdown
              id="existingBuilding"
              value={form.existingBuilding}
              name="existingBuilding"
              onChange={updateFormFields}
              onClick={(e): void => {
                e.preventDefault();
                setFormFields({
                  ...form,
                  buildingType: 'existingBuilding',
                });
              }}
              label={displayNames.existingBuilding}
              isLabelVisible={false}
              options={findCampusBuildings('Allston')}
            />
            <RadioButton
              label="Create a new building"
              value="createBuilding"
              name="buildingType"
              checked={form.buildingType === 'createBuilding'}
              onChange={updateFormFields}
            />
            <TextInput
              id="newBuilding"
              value={form.newBuilding}
              name="newBuilding"
              onChange={updateFormFields}
              onClick={(): void => setFormFields({
                ...form,
                buildingType: 'createBuilding',
              })}
              label={displayNames.newBuilding}
              isLabelVisible={false}
              labelPosition={POSITION.TOP}
            />
          </Fieldset>
          <TextInput
            id="roomName"
            name="roomName"
            label={displayNames.roomName}
            labelPosition={POSITION.TOP}
            placeholder="e.g. 150A"
            onChange={updateFormFields}
            value={form.roomName}
            errorMessage={roomNameError}
            isRequired
          />
          <TextInput
            id="capacity"
            name="capacity"
            label={displayNames.capacity}
            labelPosition={POSITION.TOP}
            placeholder="e.g. 75"
            onChange={updateFormFields}
            value={form.capacity}
            errorMessage={capacityError}
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
          id="createRoomSubmit"
          onClick={async (): Promise<void> => {
            try {
              const createdCourse = await submitRoomForm();
              await onSuccess(createdCourse);
            } catch (error) {
              setRoomModalErrorMessage((error as Error).message);
              // leave the modal visible after an error
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

export default CreateRoomModal;
