import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  Ref,
  useMemo,
  useCallback,
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
import { AxiosError } from 'axios';
import { ServerErrorInfo } from '../Courses/CourseModal';

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
  campus: 'Campus',
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
    campus: '',
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
   * The current error messages for fields in the Create Room modal
   */
  const [formErrors, setFormErrors] = useState({
    campus: '',
    building: '',
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

  let metadataBuildingIndex: number;

  /**
   * Submits the room form, checking for valid inputs
   */
  const submitRoomForm = async ():
  Promise<RoomAdminResponse> => {
    let isValid = true;
    let updatedFormErrors = {
      campus: '',
      building: '',
      roomName: '',
      capacity: '',
    };
    // If the user has selected the existing building radio button, use the
    // existing building value rather than the new building text input value
    const building = form.buildingType === 'existingBuilding'
      ? form.existingBuilding
      : form.newBuilding;

    if (form.campus) {
      const metadataCampusIndex = metadata.campuses
        .findIndex((metadataCampus) => metadataCampus.name.toLowerCase()
        === form.campus.toLowerCase());
      const metadataCampus = metadata.campuses[metadataCampusIndex];
      metadataBuildingIndex = metadataCampus.buildings
        .findIndex((metadataBuilding) => metadataBuilding.name.toLowerCase()
      === building.toLowerCase());
    }

    setFormErrors(updatedFormErrors);
    if (!form.campus) {
      updatedFormErrors = {
        ...updatedFormErrors,
        campus: 'Campus is required to submit this form.',
      };
      isValid = false;
    }
    // Either an existing or new building must be provided.
    if (!form.existingBuilding && !form.newBuilding) {
      updatedFormErrors = {
        ...updatedFormErrors,
        building: 'Building is required to submit this form.',
      };
      isValid = false;
    }
    // If the building already exists within the selected campus and the user
    // is trying to create the building, request that the user selects the
    // building from the dropdown instead.
    if (form.buildingType === 'createBuilding' && metadataBuildingIndex !== -1) {
      updatedFormErrors = {
        ...updatedFormErrors,
        building: 'This building already exists in the selected campus. Please select the building from the dropdown instead.',
      };
      isValid = false;
    }
    if (!form.roomName) {
      updatedFormErrors = {
        ...updatedFormErrors,
        roomName: 'Room number is required to submit this form.',
      };
      isValid = false;
    }
    if (Number.isNaN(parseInt(form.capacity, 10))) {
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

    const roomInfo = {
      campus: form.campus,
      building,
      name: form.roomName,
      capacity: parseInt(form.capacity, 10),
    };

    const result: RoomAdminResponse = await LocationAPI.createRoom(roomInfo);

    // Checks that the new building does not already exist in the metadata
    // before adding it.
    if (form.buildingType === 'createBuilding'
    && metadataBuildingIndex === -1) {
      metadata.updateCampuses(result);
    }
    return result;
  };

  // Ensure any previous field values and errors are cleared when opening
  // the Create Room modal.
  useEffect(() => {
    if (isVisible) {
      setFormFields({
        campus: '',
        buildingType: 'existingBuilding',
        existingBuilding: '',
        newBuilding: '',
        roomName: '',
        capacity: '',
      });
      setFormErrors({
        campus: '',
        building: '',
        roomName: '',
        capacity: '',
      });
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
   * If the campus does not exist, return a blank option.
   */
  const findCampusBuildings = useCallback((selectedCampus: string) => {
    const campus: CampusResponse = metadata.campuses
      .find((metadataCampus) => selectedCampus.toLowerCase()
        === metadataCampus.name.toLowerCase());
    if (campus) {
      const campusBuildings = campus.buildings
        .map((building) => building.name);
      return [{ value: '', label: '' }]
        .concat(campusBuildings.map((building): {
          value: string; label: string;
        } => ({
          value: building,
          label: building,
        })));
    }
    return [{ value: '', label: '' }];
  }, [metadata.campuses]);

  /**
   * Find the building options that will be displayed in the dropdown based off
   * of the campus that was selected.
   */
  const buildingOptions = useMemo(
    () => findCampusBuildings(form.campus),
    [findCampusBuildings, form.campus]
  );

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
          <Dropdown
            id="campus"
            value={form.campus}
            name="campus"
            onChange={updateFormFields}
            label={displayNames.campus}
            options={campusOptions}
            errorMessage={formErrors.campus}
            isRequired
          />
          <Fieldset
            legend="Building"
            isBorderVisible
            isLegendVisible
            errorMessage={formErrors.building}
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
              options={buildingOptions}
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
            errorMessage={formErrors.roomName}
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
            errorMessage={formErrors.capacity}
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
              onSuccess(createdCourse);
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

export default CreateRoomModal;
