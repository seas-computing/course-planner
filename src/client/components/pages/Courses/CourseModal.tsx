import React, {
  ChangeEvent,
  FunctionComponent,
  ReactElement,
  Ref,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NoteText,
  TextInput,
  VARIANT,
  Fieldset,
  RadioButton,
  Checkbox,
  Dropdown,
  ValidationErrorMessage,
} from 'mark-one';
import { MetadataContext } from 'client/context/MetadataContext';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { POSITION } from 'mark-one/lib/Forms/Label';
import {
  isSEASEnumToString,
  IS_SEAS,
  termPatternEnumToString,
  TERM_PATTERN,
} from 'common/constants';
import ValidationException from 'common/errors/ValidationException';
import { CourseAPI } from 'client/api';
import { parseCatalogNumberForPrefixNumber } from 'common/utils/courseHelperFunctions';

interface CourseModalProps {
  /**
   * Whether or not the modal should be visible on the page.
   */
  isVisible: boolean;
  /**
   * The current course being edited, or undefined if creating a new course.
   */
  currentCourse?: ManageCourseResponseDTO;
  /**
   * Handler to be invoked when the modal closes
   * e.g. to clear data entered into a form
   */
  onClose?: () => void;
  /**
   * Handler to be invoked when the edit is successful
   */
  onSuccess?: (faculty: ManageCourseResponseDTO) => Promise<void>;
}

/**
 * This component represents the create and edit course modals, which will be
 * used on the Course Admin page
 */
const CourseModal: FunctionComponent<CourseModalProps> = function ({
  isVisible,
  currentCourse,
  onSuccess,
  onClose,
}): ReactElement {
  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

  const [form, setFormFields] = useState({
    areaType: 'existingArea',
    existingArea: '',
    newArea: '',
    courseNumber: '',
    courseTitle: '',
    sameAs: '',
    isUndergraduate: false,
    isSEAS: '',
    termPattern: '',
  });

  type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const updateFormFields = (event: ChangeEvent): void => {
    const target = event.target as FormField;
    // Convert checkbox to true or false
    const value = target.type === 'checkbox'
      ? (target as HTMLInputElement).checked
      : target.value;
    setFormFields({
      ...form,
      [target.name]:
      value,
    });
  };

  /**
   * The current value of the error message for the Course Area
   */
  const [
    areaErrorMessage,
    setAreaErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Course Number field
   */
  const [
    courseNumberErrorMessage,
    setCourseNumberErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Course Title field
   */
  const [
    courseTitleErrorMessage,
    setCourseTitleErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message for the Term Pattern dropdown
   */
  const [
    termPatternErrorMessage,
    setTermPatternErrorMessage,
  ] = useState('');
  /**
   * The current value of the error message within the Course modal
   */
  const [
    courseErrorMessage,
    setCourseErrorMessage,
  ] = useState('');

  /**
   * The current value of the Create Course Modal ref
   */
  const modalHeaderRef: Ref<HTMLHeadingElement> = useRef(null);

  /**
   * Set the ref focus.
   * Since modal may not have been rendered in DOM, wait for it to be
   * rendered by letting next task of event queue run first.
   */
  const setCourseModalFocus = (): void => {
    setTimeout((): void => modalHeaderRef.current.focus());
  };

  /**
   * Submits the course form, checking for valid inputs
   */
  const submitCourseForm = async ():
  Promise<ManageCourseResponseDTO> => {
    let isValid = true;
    // Make sure only errors that have not been fixed are shown.
    setAreaErrorMessage('');
    setCourseNumberErrorMessage('');
    setCourseTitleErrorMessage('');
    setTermPatternErrorMessage('');
    setCourseErrorMessage('');
    if (!(form.existingArea && form.newArea)) {
      setAreaErrorMessage('Area is required to submit this form.');
      isValid = false;
    }
    if (form.areaType === 'createArea' && metadata.areas.indexOf(form.newArea) !== -1) {
      setAreaErrorMessage('Area already exists.');
      isValid = false;
    }
    if (!form.courseNumber) {
      setCourseNumberErrorMessage('Course number is required to submit this form.');
      isValid = false;
    }
    if (!form.courseTitle) {
      setCourseTitleErrorMessage('Course title is required to submit this form.');
      isValid = false;
    }
    if (!form.termPattern) {
      setTermPatternErrorMessage('Term pattern is required to submit this form.');
      isValid = false;
    }
    if (!isValid) {
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }
    let result: ManageCourseResponseDTO;
    if (currentCourse) {
      result = await CourseAPI.editCourse({
        id: currentCourse.id,
        area: {
          id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
          name: 'AP',
        },
        prefix: parseCatalogNumberForPrefixNumber(form.courseNumber).prefix,
        number: parseCatalogNumberForPrefixNumber(form.courseNumber).number,
        title: form.courseTitle,
        sameAs: form.sameAs,
        isUndergraduate: form.isUndergraduate as unknown as boolean,
        isSEAS: form.isSEAS as IS_SEAS,
        termPattern: form.termPattern as TERM_PATTERN,
        private: true,
      });
    } else {
      result = await CourseAPI.createCourse({
        area: {
          id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
          name: 'AP',
        },
        prefix: parseCatalogNumberForPrefixNumber(form.courseNumber).prefix,
        number: parseCatalogNumberForPrefixNumber(form.courseNumber).number,
        title: form.courseTitle,
        sameAs: form.sameAs,
        isUndergraduate: form.isUndergraduate as unknown as boolean,
        isSEAS: form.isSEAS as IS_SEAS,
        termPattern: form.termPattern as TERM_PATTERN,
        private: true,
      });
    }
    return result;
  };
  useEffect((): void => {
    if (isVisible) {
      setFormFields({
        areaType: 'existingArea',
        existingArea: currentCourse ? currentCourse.area.name : '',
        newArea: '',
        courseNumber: currentCourse ? (currentCourse.catalogNumber || '') : '',
        courseTitle: currentCourse ? (currentCourse.title || '') : '',
        sameAs: currentCourse ? (currentCourse.sameAs || '') : '',
        isUndergraduate: currentCourse ? currentCourse.isUndergraduate : false,
        isSEAS: currentCourse ? currentCourse.isSEAS : IS_SEAS.Y,
        termPattern: currentCourse ? (currentCourse.termPattern || '') : '',
      });
      setAreaErrorMessage('');
      setCourseNumberErrorMessage('');
      setCourseTitleErrorMessage('');
      setTermPatternErrorMessage('');
      setCourseErrorMessage('');
      setCourseModalFocus();
    }
  }, [isVisible, currentCourse]);
  return (
    <Modal
      ariaLabelledBy="editCourse"
      closeHandler={onClose}
      isVisible={isVisible}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        {currentCourse ? 'Edit Course' : 'Create New Course'}
      </ModalHeader>
      <ModalBody>
        <NoteText>Note: * denotes a required field</NoteText>
        <form id="editCourseForm">
          <Fieldset
            legend="Course Area"
            isBorderVisible={false}
            isLegendVisible={false}
            errorMessage={areaErrorMessage}
            isRequired
          >
            <RadioButton
              label="Select an existing area"
              value="existingArea"
              name="areaType"
              checked={form.areaType === 'existingArea'}
              onChange={updateFormFields}
            />
            <Dropdown
              id="existingArea"
              value={form.existingArea}
              name="existingArea"
              onChange={updateFormFields}
              label=""
              // Insert an empty option so that no area is pre-selected in dropdown
              options={
                [{ value: '', label: '' }]
                  .concat(metadata.areas.map((area): {
                    value: string;label: string;
                  } => ({
                    value: area,
                    label: area,
                  })))
              }
            />
            <RadioButton
              label="Create a new area"
              value="createArea"
              name="areaType"
              checked={form.areaType === 'createArea'}
              onChange={updateFormFields}
            />
            <TextInput
              id="newArea"
              value={form.newArea}
              name="newArea"
              onChange={updateFormFields}
              label=""
            />
          </Fieldset>
          <TextInput
            id="courseNumber"
            name="courseNumber"
            label="Course Number"
            labelPosition={POSITION.TOP}
            placeholder="e.g. AC 209"
            onChange={updateFormFields}
            value={form.courseNumber}
            errorMessage={courseNumberErrorMessage}
            isRequired
          />
          <TextInput
            id="courseTitle"
            name="courseTitle"
            label="Course Title"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Introduction to Data Science"
            onChange={updateFormFields}
            value={form.courseTitle}
            errorMessage={courseTitleErrorMessage}
            isRequired
          />
          <TextInput
            id="sameAs"
            name="sameAs"
            label="Same as..."
            labelPosition={POSITION.TOP}
            placeholder="e.g. AC 221"
            onChange={updateFormFields}
            value={form.sameAs}
          />
          <Fieldset
            legend="Undergraduate"
            isBorderVisible={false}
            isLegendVisible={false}
          >
            <Checkbox
              id="isUndergraduate"
              name="isUndergraduate"
              checked={form.isUndergraduate}
              label="Undergraduate"
              onChange={updateFormFields}
            />
          </Fieldset>
          <Dropdown
            id="isSEAS"
            name="isSEAS"
            label="Is SEAS"
            options={Object.values(IS_SEAS)
              .map((isSEASOption):
              {value: string; label: string} => {
                const isSEASDisplayTitle = isSEASEnumToString(isSEASOption);
                return {
                  value: isSEASOption,
                  label: isSEASDisplayTitle,
                };
              })}
            onChange={updateFormFields}
            value={form.isSEAS}
            isRequired
          />
          <Dropdown
            id="termPattern"
            name="termPattern"
            label="Term Pattern"
            options={[{ value: '', label: '' }]
              .concat(Object.values(TERM_PATTERN)
                .map((termPatternOption):
                {value: string; label: string} => {
                  const termPatternDisplayTitle = termPatternEnumToString(
                    termPatternOption
                  );
                  return {
                    value: termPatternOption,
                    label: termPatternDisplayTitle,
                  };
                }))}
            onChange={updateFormFields}
            value={form.termPattern}
            errorMessage={termPatternErrorMessage}
            isRequired
          />
          {courseErrorMessage && (
            <ValidationErrorMessage
              id="editCourseModalErrorMessage"
            >
              {courseErrorMessage}
            </ValidationErrorMessage>
          )}
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="editCourseSubmit"
          onClick={async (): Promise<void> => {
            try {
              const editedCourse = await submitCourseForm();
              await onSuccess(editedCourse);
            } catch (error) {
              setCourseErrorMessage((error as Error).message);
              // leave the modal visible after an error
              return;
            }
            if (onClose != null) {
              onClose();
            }
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

export default CourseModal;
