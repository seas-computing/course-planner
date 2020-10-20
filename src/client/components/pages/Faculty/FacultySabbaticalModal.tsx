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
  ValidationErrorMessage,
} from 'mark-one';
import { MetadataContext } from 'client/context/MetadataContext';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { FacultyAPI } from 'client/api';
import { ABSENCE_TYPE } from 'common/constants';
import { absenceEnumToTitleCase } from 'common/utils/facultyHelperFunctions';

interface SabbaticalModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current faculty entry being edited.
   */
  currentFaculty?: FacultyResponseDTO;
  /**
   * Handler to be invoked when the modal closes
   * e.g. to clear data entered into a form
   */
  onClose?: () => void;
  /**
   * Handler to be invoked when the edit is successful
   */
  onSuccess?: (faculty: FacultyResponseDTO) => Promise<void>;
}

/**
 * This component represents the Faculty Sabbatical/Leave modal, which appears
 * on the Faculty tab
 */
const FacultySabbaticalModal:
FunctionComponent<SabbaticalModalProps> = function ({
  isVisible,
  currentFaculty,
  onClose,
  onSuccess,
}): ReactElement {
  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

  const [form, setFormFields] = useState({
    absence: '',
  });

  const updateFormFields = (event: ChangeEvent): void => {
    const target = event.target as HTMLSelectElement;
    setFormFields({
      ...form,
      [target.name]:
      target.value,
    });
  };

  /**
   * The current value of the error message within the sabbatical/leave modal
   */
  const [
    sabbaticalLeaveErrorMessage,
    setSabbaticalLeaveErrorMessage,
  ] = useState('');

  /**
   * The current value of the Sabbatical/Leave Modal ref
   */
  const modalHeaderRef: Ref<HTMLHeadingElement> = useRef(null);

  /**
   * Set the ref focus.
   * Since modal may not have been rendered in DOM, wait for it to be
   * rendered by letting next task of event queue run first.
   */
  const setSabbaticalLeaveModalFocus = (): void => {
    setTimeout((): void => modalHeaderRef.current.focus());
  };

  //   /**
  //    * TODO: Submits the faculty sabbatical/leave form
  //    */
  //   const submitSabbaticalLeaveForm = async (): Promise<FacultyResponseDTO> => {
  //     let result: FacultyResponseDTO;
  //     result = await FacultyAPI.
  //   };

  useEffect((): void => {
    if (isVisible) {
      setFormFields({
        absence: currentFaculty.fall
          ? currentFaculty.fall.absence.type
          : currentFaculty.spring.absence.type,
      });
    }
  }, [isVisible, currentFaculty]);
  return (
    <Modal
      ariaLabelledBy="editFacultySabbaticalLeave"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {`Sabbatical/Leave for ${currentFaculty.firstName} ${currentFaculty.lastName}`}
      </ModalHeader>
      <ModalBody>
        <form id="editSabbaticalLeaveForm">
          <Dropdown
            id="sabbaticalLeave"
            name="sabbaticalLeave"
            label="Sabbatical/Leave"
            isLabelVisible={false}
            options={(Object.values(ABSENCE_TYPE)
              .map((absence):
              {value: string; label: string} => {
                const absenceTitle = absenceEnumToTitleCase(absence);
                return {
                  value: absence,
                  label: absenceTitle,
                };
              }))}
            onChange={updateFormFields}
            value={form.absence}
          />
          {sabbaticalLeaveErrorMessage && (
            <ValidationErrorMessage
              id="editSabbaticalLeaveErrorMessage"
            >
              {sabbaticalLeaveErrorMessage}
            </ValidationErrorMessage>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="editSabbaticalLeaveSubmit"
          onClick={async (): Promise<void> => {
            // try {
            //   const editedSabbaticalLeave = await submitSabbaticalLeaveForm();
            //   await onSuccess(editedSabbaticalLeave);
            // } catch (error) {
            //   setSabbaticalLeaveErrorMessage((error as Error).message);
            //   // leave the modal visible after an error
            //   return;
            // }
            // if (onClose != null) {
            //   onClose();
            // }
          }}
          variant={VARIANT.PRIMARY}
        >
          Submit
        </Button>
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

export default FacultySabbaticalModal;
