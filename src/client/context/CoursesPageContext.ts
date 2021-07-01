import { createContext, Ref } from 'react';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { TERM } from 'common/constants';

/**
 * Course information needed to access course instance information and
 * appropriately set the ref on Meeting Modal open/close
 */
export interface CoursesPageCourseInstance {
  /**
   * The current course
   */
  course: CourseInstanceResponseDTO;
  /**
   * The current term
   */
  term: TERM;
}

/**
 * Context required by the components within the Courses Page to avoid adding
 * parameters to dynamic column API
 */
export interface CoursesPageContextValue {
  /**
   * A function used to set the current course instance and appropriate ref on
   * Meeting Modal open
   */
  onMeetingEdit: (courseInstance: CoursesPageCourseInstance) => void;
  /**
   * The ref of the edit meeting button on the Courses Page
   */
  meetingEditButtonRef: Ref<HTMLButtonElement>;
  /**
   * The current course
   */
  currentCourseInstance: CoursesPageCourseInstance;
}

/**
 * Manages the current course instance through Context
 */
export const CoursesPageContext = createContext<CoursesPageContextValue>(null);
