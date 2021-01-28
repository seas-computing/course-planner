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
  Dropdown,
  ValidationErrorMessage,
} from 'mark-one';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { FacultyAPI } from 'client/api';
import { ABSENCE_TYPE } from 'common/constants';
import { absenceEnumToTitleCase } from 'common/utils/facultyHelperFunctions';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';

interface AbsenceModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current faculty entry being edited.
   */
  currentFaculty: FacultyResponseDTO;
  /**
   * The current absence entry being edited.
   */
  currentAbsence: AbsenceResponseDTO;
  /**
   * Handler to be invoked when the edit is successful
   */
  onSuccess?: () => void;
  /**
   * Handler to be invoked when the modal is canceled
   */
  onCancel: () => void;
}

/**
 * This component represents the Faculty Sabbatical/Leave modal, which appears
 * on the Faculty tab
 */
const FacultyAbsenceModal:
FunctionComponent<AbsenceModalProps> = ({
  isVisible,
  currentFaculty,
  currentAbsence,
  onCancel,
  onSuccess,
}): ReactElement => {
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
    absenceErrorMessage,
    setAbsenceErrorMessage,
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
  const setAbsenceModalFocus = (): void => {
    setTimeout((): void => {
      if (modalHeaderRef.current !== null) {
        modalHeaderRef.current.focus();
      }
    });
  };

  /**
   * Submits the faculty sabbatical/leave form
   */
  const submitAbsenceForm = async ():
  Promise<AbsenceResponseDTO> => {
    const updatedAbsenceInfo = {
      id: currentAbsence.id,
      type: form.absence as ABSENCE_TYPE,
    };
    const result: AbsenceResponseDTO = await FacultyAPI
      .updateFacultyAbsence(updatedAbsenceInfo);
    return result;
  };

  /**
   * Sets the absence information for the currently selected absence, clears
   * any previous errors from the modal, and sets the modal focus to its header
   */
  useEffect((): void => {
    if (isVisible) {
      setFormFields({
        absence: currentAbsence.type,
      });
      setAbsenceErrorMessage('');
      setAbsenceModalFocus();
    }
  }, [isVisible, currentAbsence]);
  return (
    <Modal
      ariaLabelledBy="editFacultySabbaticalLeave"
      closeHandler={onCancel}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {`Sabbatical/Leave for ${currentFaculty.firstName} ${currentFaculty.lastName}`}
      </ModalHeader>
      <ModalBody>
        <form id="editAbsenceForm">
          <Dropdown
            id="sabbaticalLeave"
            name="absence"
            label="Sabbatical/Leave"
            isLabelVisible={false}
            options={(Object.values(ABSENCE_TYPE)
              .map((absence):
              {value: string;label: string} => {
                const absenceTitle = absenceEnumToTitleCase(absence);
                return {
                  value: absence,
                  label: absenceTitle === 'Present' ? 'None' : absenceTitle,
                };
              }))}
            onChange={updateFormFields}
            value={form.absence}
          />
          {absenceErrorMessage && (
            <ValidationErrorMessage
              id="editAbsenceFormErrorMessage"
            >
              {absenceErrorMessage}
            </ValidationErrorMessage>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="editSabbaticalLeaveSubmit"
          onClick={async (): Promise<void> => {
            try {
              await submitAbsenceForm();
              onSuccess();
            } catch (error) {
              setAbsenceErrorMessage((error as Error).message);
              // leave the modal visible after an error
            }
          }}
          variant={VARIANT.PRIMARY}
        >
          Submit
        </Button>
        <Button
          onClick={onCancel}
          variant={VARIANT.SECONDARY}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FacultyAbsenceModal;
