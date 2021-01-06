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
  POSITION,
} from 'mark-one';
import { MetadataContext } from 'client/context/MetadataContext';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import {
  isSEASEnumToString,
  IS_SEAS,
  termPatternEnumToString,
  TERM_PATTERN,
} from 'common/constants';
import ValidationException from 'common/errors/ValidationException';
import { CourseAPI } from 'client/api';

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
  onSuccess?: (course: ManageCourseResponseDTO) => Promise<void>;
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

  /**
   * Manages the current state of the Course Admin modal form fields
   */
  const [form, setFormFields] = useState({
    areaType: 'existingArea',
    existingArea: '',
    newArea: '',
    catalogPrefix: '',
    courseNumber: '',
    courseTitle: '',
    sameAs: '',
    isUndergraduate: false,
    isSEAS: '',
    termPattern: '',
  });

  type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  /**
   * Updates the state of the modal form fields as user edits form fields
   */
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
   * Keeps track of the error messages for various fields in the course admin modal
   */
  const [formErrors, setFormErrors] = useState({
    area: '',
    courseTitle: '',
    termPattern: '',
  });

  /**
   * Keeps track of the overall error message for the course admin modal
   */
  const [
    courseModalError,
    setCourseModalError,
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
    const trimmedNewArea = form.newArea.trim();
    // An intermediary object of modal errors needed as setting the formErrors
    // state directly after each conditional below clears out existing errors
    // in the modal, while we want all errors to show at once.
    // Make sure only errors that have not been fixed are shown by
    // initializing to ''.
    const modalError = {
      area: '',
      courseTitle: '',
      termPattern: '',
    };
    // The second "or" checks for the case when the "create a new area" radio
    // button is selected, the create a new area text input is empty, and the
    // user has selected an existing area from the dropdown
    if (!(form.existingArea || trimmedNewArea) || (form.areaType === 'createArea' && !trimmedNewArea)) {
      modalError.area = 'Area is required to submit this form.';
    }
    if (!form.courseTitle) {
      modalError.courseTitle = 'Course title is required to submit this form.';
    }
    if (!form.termPattern) {
      modalError.termPattern = 'Term pattern is required to submit this form.';
    }
    setFormErrors(modalError);
    if (Object.values(modalError).some((err) => err !== '')) {
      throw new ValidationException('Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.');
    }
    let result: ManageCourseResponseDTO;

    const courseInfo = {
      area: form.areaType === 'createArea' ? trimmedNewArea : form.existingArea,
      prefix: form.catalogPrefix.trim(),
      number: form.courseNumber.trim(),
      title: form.courseTitle.trim(),
      sameAs: form.sameAs.trim(),
      isUndergraduate: form.isUndergraduate,
      isSEAS: form.isSEAS as IS_SEAS,
      termPattern: form.termPattern as TERM_PATTERN,
      private: true,
    };
    if (currentCourse) {
      result = await CourseAPI.editCourse({
        id: currentCourse.id,
        ...courseInfo,
      });
    } else {
      result = await CourseAPI.createCourse(courseInfo);
    }
    // Before adding the new area to the modal's area dropdown, check that it
    // does not yet exist in the dropdown since we're allowing existing areas
    // to be entered under the "Create New Area" section.
    // In the controller, we are using the existing area instead of creating a
    // new area for this case.
    if (form.areaType === 'createArea' && metadata.areas.indexOf(trimmedNewArea) === -1) {
      metadata.updateAreas(trimmedNewArea);
    }
    return result;
  };
  useEffect((): void => {
    if (isVisible) {
      setFormFields({
        areaType: 'existingArea',
        existingArea: currentCourse ? currentCourse.area.name : '',
        newArea: '',
        catalogPrefix: currentCourse ? (currentCourse.prefix || '') : '',
        courseNumber: currentCourse ? (currentCourse.number || '') : '',
        courseTitle: currentCourse ? (currentCourse.title || '') : '',
        sameAs: currentCourse ? (currentCourse.sameAs || '') : '',
        isUndergraduate: currentCourse ? currentCourse.isUndergraduate : false,
        isSEAS: currentCourse ? currentCourse.isSEAS : IS_SEAS.Y,
        termPattern: currentCourse ? (currentCourse.termPattern || '') : '',
      });
      setFormErrors({
        area: '',
        courseTitle: '',
        termPattern: '',
      });
      setCourseModalError('');
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
            isBorderVisible
            isLegendVisible
            errorMessage={formErrors.area}
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
              onClick={(e): void => {
                e.preventDefault();
                setFormFields({
                  ...form,
                  areaType: 'existingArea',
                });
              }}
              label="Existing Area"
              isLabelVisible={false}
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
              onClick={(): void => setFormFields({
                ...form,
                areaType: 'createArea',
              })}
              label="New Area"
              isLabelVisible={false}
              labelPosition={POSITION.TOP}
            />
          </Fieldset>
          <TextInput
            id="catalogPrefix"
            name="catalogPrefix"
            label="Catalog Prefix"
            labelPosition={POSITION.TOP}
            placeholder="e.g. AC"
            onChange={updateFormFields}
            value={form.catalogPrefix}
          />
          <TextInput
            id="courseNumber"
            name="courseNumber"
            label="Course Number"
            labelPosition={POSITION.TOP}
            placeholder="e.g. 209"
            onChange={updateFormFields}
            value={form.courseNumber}
          />
          <TextInput
            id="courseTitle"
            name="courseTitle"
            label="Course Title"
            labelPosition={POSITION.TOP}
            placeholder="e.g. Introduction to Data Science"
            onChange={updateFormFields}
            value={form.courseTitle}
            errorMessage={formErrors.courseTitle}
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
          <Checkbox
            id="isUndergraduate"
            name="isUndergraduate"
            checked={form.isUndergraduate}
            label="Undergraduate"
            onChange={updateFormFields}
            labelPosition={POSITION.RIGHT}
          />
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
            errorMessage={formErrors.termPattern}
            isRequired
          />
          {courseModalError && (
            <ValidationErrorMessage
              id="editCourseModalErrorMessage"
            >
              {courseModalError}
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
              setCourseModalError((error as Error).message);
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
