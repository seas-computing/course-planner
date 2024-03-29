import React, {
  FunctionComponent, useState, useEffect, useContext, ChangeEvent, useCallback,
} from 'react';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { getCourseScheduleForSemester } from 'client/api/courses';
import { DEGREE_PROGRAM, TERM, getCatPrefixColor } from 'common/constants';
import {
  Dropdown, POSITION, LoadSpinner, Button, VARIANT, fromTheme,
} from 'mark-one';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MessageContext, MetadataContext } from 'client/context';
import { termEnumToTitleCase } from 'common/utils/termHelperFunctions';
import { toTitleCase } from 'common/utils/util';
import { ButtonProps } from 'mark-one/lib/Buttons/Button';
import styled from 'styled-components';
import MenuFlex from 'client/components/general/flex/MenuFlex';
import VerticalSpace from 'client/components/layout/VerticalSpace';
import ScheduleView from './ScheduleView';
import { useStoredState } from '../../../hooks/useStoredState';

/**
 * Parameters for how the schedule view should be displayed. Currently using
 * static values.
 *
 * TODO: Consider deriving start and end times from schedule data
 */

const FIRST_HOUR = 8;
const LAST_HOUR = 22;
declare type DegreeProgramEvent=ChangeEvent<HTMLSelectElement> & {
  target: {value: DEGREE_PROGRAM}
};
/** Describes the currently selected semester */
export interface SemesterSelection {
  term: TERM;
  calendarYear: number;
}
/**
 * Represents a state field for tracking whether a course prefix is
 * active or inactive in the schedule.
 */
export interface PrefixState{
  prefix: string;
  active: boolean;
}
/**
 * A button to filter course prefixes and fade sessionblock based
 * on selected value
 */
const PrefixButton = styled(Button) <ButtonProps & { prefix: string, isPrefixActive: boolean; }>`
 margin: ${fromTheme('ws', 'small')};
 opacity : ${({ isPrefixActive }) => (isPrefixActive ? '' : 0.5)};
 background-color: ${({ prefix }) => getCatPrefixColor(prefix)};
`;

/**
 * This is the top-level page component for the Schedule. It's responsible for
 * fetching the data from the API, and for managing the state of any user-
 * selectable filters.
 */

const SchedulePage: FunctionComponent = () => {
  /**
   * Maintain the complete schedule data from the API in state
   */
  const [schedule, setSchedule] = useState<ScheduleViewResponseDTO[]>([]);

  /**
   * The function for displaying messages in the user interface
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Provides the current Academic Year from the server
   * Later, we may add the current Term to metadata
   */
  const {
    currentAcademicYear,
    semesters,
    catalogPrefixes,
  } = useContext(MetadataContext);

  /**
   * Keeps track of the currently selectedterm
   */
  const [
    selectedSemester,
    setSelectedSemester,
  ] = useStoredState<SemesterSelection>('SCHEDULE_SEMESTER_SELECTION');

  /**
 * Filter the courses for which data will be shown in the table
 */
  const [prefixes, setPrefixes] = useState <PrefixState[]>([]);
  useEffect(() => {
    const newPrefixes = catalogPrefixes.map((prefix) => ({
      prefix,
      active: true,
    }));
    setPrefixes(newPrefixes);
  }, [catalogPrefixes]);

  const togglePrefix = (prefix: string) => {
    setPrefixes((prevState) => {
      // duplicate the array, though object references will stay the same
      const newState = [...prevState];
      // find the desired prefix object and replace it in our newState
      const prefixIndex = newState.findIndex((p) => p.prefix === prefix);
      newState.splice(
        prefixIndex, 1, { prefix, active: !prevState[prefixIndex].active }
      );
      return newState;
    });
  };
  const isPrefixActive = useCallback((prefix:string) => {
    const prefixObj = prefixes.find((p) => p.prefix === prefix);
    return prefixObj.active;
  }, [prefixes]);
  /* Track the degree program for which data will be shown in the table
  */
  const [
    selectedDegreeProgram,
    setSelectedDegreeProgram,
  ] = useState<DEGREE_PROGRAM>(DEGREE_PROGRAM.BOTH);

  /**
   * Whether an API request is in progress
   */
  const [isFetching, setFetching] = useState<boolean>(false);

  /**
   * Map the metadata semesters into Dropdown-compatible options
   */
  const semesterOptions = semesters
    .map((semester) => ({
      value: semester,
      label: toTitleCase(semester),
    }));

  /**
   * Update handler for the dropdown, which passes the selected term/year combo
   * into the state value
   */
  const updateTerm = ({
    target: {
      value,
    },
  }: React.ChangeEvent<HTMLSelectElement>) => {
    if (value) {
      const [term, year] = value.split(' ');
      setSelectedSemester({
        term: (term.toUpperCase() === TERM.SPRING) ? TERM.SPRING : TERM.FALL,
        calendarYear: parseInt(year, 10),
      });
    }
  };

  /**
   * When the page loads, set the selectedSemester to the present Semester
   */
  useEffect(():void => {
    if (!selectedSemester) {
      const today = new Date();
      // Check if current month is later than or equal to July
      if (today.getMonth() >= 6) {
        setSelectedSemester({
          term: TERM.FALL,
          calendarYear: currentAcademicYear - 1,
        });
      } else {
        setSelectedSemester({
          term: TERM.SPRING,
          calendarYear: currentAcademicYear,
        });
      }
    }
  }, [currentAcademicYear, selectedSemester, setSelectedSemester]);

  /**
   * Fetch the schedule data from the server, store it in state to pass into
   * the ScheduleView
   */
  useEffect(():void => {
    if (selectedSemester) {
      setFetching(true);
      const { term, calendarYear } = selectedSemester;
      getCourseScheduleForSemester(calendarYear, term)
        .then((data):void => {
          if (data.length === 0) {
            dispatchMessage({
              message: new AppMessage(
                `There is no schedule data for ${termEnumToTitleCase(term)} ${calendarYear}.`,
                MESSAGE_TYPE.ERROR
              ),
              type: MESSAGE_ACTION.PUSH,
            });
          }
          setSchedule(data);
        })
        .catch(():void => {
          dispatchMessage({
            message: new AppMessage(
              'Unable to get schedule data from server. If the problem persists, contact SEAS Computing',
              MESSAGE_TYPE.ERROR
            ),
            type: MESSAGE_ACTION.PUSH,
          });
        }).finally(() => {
          setFetching(false);
        });
    }
  }, [
    selectedSemester,
    setSchedule,
    dispatchMessage,
    setFetching,
  ]);

  return (
    <>
      <div aria-label="course-filter-buttons">
        <span id="course-filter-buttons">Show/Hide Catalog Prefixes</span>
        {prefixes.map((prefixObj) => (
          <PrefixButton
            isPrefixActive={prefixObj.active}
            aria-labelledby="course-filter-button"
            alt="Course Filter Button"
            prefix={prefixObj.prefix}
            variant={VARIANT.BASE}
            key={prefixObj.prefix}
            onClick={() => togglePrefix(prefixObj.prefix)}
          >
            {prefixObj.prefix}
          </PrefixButton>
        ))}
      </div>
      <VerticalSpace>
        <MenuFlex>
          <Dropdown
            id="degree-program-selector"
            name="degree-program-selector"
            label="Degree Program"
            isLabelVisible
            labelPosition={POSITION.LEFT}
            options={Object.values(DEGREE_PROGRAM)
              .map((value) => ({ value, label: value }))}
            value={selectedDegreeProgram}
            onChange={
              ({
                target: { value },
              }: DegreeProgramEvent) => {
                setSelectedDegreeProgram(value);
              }
            }
          />
          {selectedSemester && (
            <Dropdown
              id="schedule-semester-selector"
              name="schedule-semester-selector"
              label="Select Semester"
              labelPosition={POSITION.LEFT}
              value={`${selectedSemester.term} ${selectedSemester.calendarYear}`}
              options={semesterOptions}
              onChange={updateTerm}
            />
          )}
        </MenuFlex>
      </VerticalSpace>
      {isFetching
        ? (
          <LoadSpinner>
            Fetching Course Schedule
          </LoadSpinner>
        )
        : (
          <ScheduleView
            schedule={schedule}
            firstHour={FIRST_HOUR}
            lastHour={LAST_HOUR}
            degreeProgram={selectedDegreeProgram}
            isPrefixActive={isPrefixActive}
          />
        )}
    </>
  );
};
export default SchedulePage;
