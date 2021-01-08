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
import { CourseAPI } from 'client/api';
import { AxiosError } from 'client/api/request';

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

interface FormErrors {
  area: string;
  title: string;
  isSEAS: string;
  termPattern: string;
}

const generalErrorMessage = 'Please fill in the required fields and try again. If the problem persists, contact SEAS Computing.';

interface BadRequestErrorProblem {
  children: unknown[];
  constraints: Record<string, string>;
  property: string;
}

interface BadRequestError {
  statusCode: string;
  error: string;
  message: BadRequestErrorProblem[];
}

const displayNames: Record<string, string> = {
  existingArea: 'Existing Area',
  newArea: 'New Area',
  catalogPrefix: 'Catalog Prefix',
  courseNumber: 'Course Number',
  courseTitle: 'Course Title',
  sameAs: 'Same As',
  isUndergraduate: 'Undergraduate',
  isSEAS: 'Is SEAS',
  termPattern: 'Term Pattern',
};

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
    title: '',
    isSEAS: '',
    termPattern: '',
  } as FormErrors);

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
    const area = form.areaType === 'createArea' ? form.newArea : form.existingArea;
    let result: ManageCourseResponseDTO;
    const courseInfo = {
      area,
      prefix: form.catalogPrefix,
      number: form.courseNumber,
      title: form.courseTitle,
      sameAs: form.sameAs,
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
    if (form.areaType === 'createArea' && metadata.areas.indexOf(area) === -1) {
      metadata.updateAreas(area);
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
        title: '',
        isSEAS: '',
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
              label={displayNames.existingArea}
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
              label={displayNames.newArea}
              isLabelVisible={false}
              labelPosition={POSITION.TOP}
            />
          </Fieldset>
          <TextInput
            id="catalogPrefix"
            name="catalogPrefix"
            label={displayNames.catalogPrefix}
            labelPosition={POSITION.TOP}
            placeholder="e.g. AC"
            onChange={updateFormFields}
            value={form.catalogPrefix}
          />
          <TextInput
            id="courseNumber"
            name="courseNumber"
            label={displayNames.courseNumber}
            labelPosition={POSITION.TOP}
            placeholder="e.g. 209"
            onChange={updateFormFields}
            value={form.courseNumber}
          />
          <TextInput
            id="courseTitle"
            name="courseTitle"
            label={displayNames.courseTitle}
            labelPosition={POSITION.TOP}
            placeholder="e.g. Introduction to Data Science"
            onChange={updateFormFields}
            value={form.courseTitle}
            errorMessage={formErrors.title}
            isRequired
          />
          <TextInput
            id="sameAs"
            name="sameAs"
            label={displayNames.sameAs}
            labelPosition={POSITION.TOP}
            placeholder="e.g. AC 221"
            onChange={updateFormFields}
            value={form.sameAs}
          />
          <Checkbox
            id="isUndergraduate"
            name="isUndergraduate"
            checked={form.isUndergraduate}
            label={displayNames.isUndergraduate}
            onChange={updateFormFields}
            labelPosition={POSITION.RIGHT}
          />
          <Dropdown
            id="isSEAS"
            name="isSEAS"
            label={displayNames.isSEAS}
            options={[{ value: '', label: '' }]
              .concat(Object.values(IS_SEAS)
                .map((isSEASOption):
                {value: string; label: string} => {
                  const isSEASDisplayTitle = isSEASEnumToString(isSEASOption);
                  return {
                    value: isSEASOption,
                    label: isSEASDisplayTitle,
                  };
                }))}
            onChange={updateFormFields}
            value={form.isSEAS}
            errorMessage={formErrors.isSEAS}
            isRequired
          />
          <Dropdown
            id="termPattern"
            name="termPattern"
            label={displayNames.termPattern}
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
              if ((error as AxiosError).response) {
                const serverError = error as AxiosError;
                const { response } = serverError;
                if (response.data
                    && (response.data as BadRequestError).message) {
                  const data = response.data as BadRequestError;
                  const messages = data.message;
                  const errors = {};
                  messages.forEach((problem) => {
                    const { property } = problem;
                    // Since the error message returned from the server includes
                    // the property name in camel case, this converts the property
                    // name to be more understandable by the user (e.g. 'termPattern'
                    // becomes 'Term Pattern'). The rest of the error message follows.
                    let displayName = displayNames[property];
                    // If we don't know the display name,
                    // convert the property to title case for user readability.
                    if (!displayName) {
                      // Convert from camel case to title case
                      displayName = property.replace(
                        /([a-z])([A-Z])/g, '$1 $2'
                      );
                      displayName = displayName.charAt(0)
                        .toUpperCase() + displayName
                        .slice(1);
                    }
                    // We ignore the object keys
                    // since they don't contain additional info
                    errors[property] = Object.values(problem.constraints)
                      // Replace the beginning with the display name
                      // if the first word of the error is the property name
                      .map((constraint) => constraint.replace(
                        new RegExp('^' + property + '\\b'),
                        displayName
                      ))
                      // If we get multiple errors per property, separate them
                      .join('; ');
                  });
                  setFormErrors(errors as FormErrors);
                  setCourseModalError(generalErrorMessage);
                } else {
                  setCourseModalError((error as Error).message);
                }
              } else {
                setCourseModalError((error as Error).message);
              }
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
