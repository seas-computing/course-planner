import React, { FunctionComponent, useState } from 'react';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import DAY, { dayEnumToString } from 'common/constants/day';
import { Popover } from 'mark-one';
import { DEGREE_PROGRAM } from 'common/constants';
import {
  WeekBlock, DayBlock, CourseListing, SessionBlock, CourseListingButton,
} from './blocks';
import { PGTime } from '../../../../common/utils/PGTime';
import { HiddenText } from '../../general';

interface ScheduleViewProps {
  /**
   * The complete course schedule for the currently chosen year/semester. Must
   * be organized by Day, then startTime, then duration, then prefix.
   */
  schedule: ScheduleViewResponseDTO[];

  /**
   * The first hour that should be shown in the schedule
   * This is inclusive; we'll see courses scheduled during this hour
   */
  firstHour: number;

  /**
   * The last hour that should be shown in the schedule
   * This is exclusive; we won't see any courses scheduled during this hour
   */
  lastHour: number;

  /**
   * The number of minutes represented by each row of the grid.
   * The default value of 5 is **strongly** recommended.
   */
  minuteResolution?: 1 | 3 | 5 | 15;

  /**
   * List of the days of the week that should be shown in the schedule.
   * Making this a prop so that we can potentially use it for day-by-day
   * pagination in the future
   */
  days?: string[];

  /**
   * How tall each grid row of the schedule should be. The number of minutes
   * represented by each grid row is controller by the minuteResolution prop
   */
  rowHeight?: string;

  /**
   * The Degree program of the data currently being displayed
   */
  degreeProgram?: DEGREE_PROGRAM;

  /**
   * The course prefix data that's currently active
   */
  isPrefixActive: (prefix: string) => boolean;
}

/**
 * Handles rendering the complete course schedule, setting up the necessary
 * grids for the week and days, then placing in the individual blocks for the
 * different Sessions.
 */
const ScheduleView: FunctionComponent<ScheduleViewProps> = ({
  schedule,
  firstHour,
  lastHour,
  minuteResolution,
  rowHeight,
  days,
  degreeProgram,
  isPrefixActive,
}) => {
  // Convert the range of hours covered by our Schedule to a number of
  // css-grid rows
  const numRows = ((lastHour - firstHour) * 60)
      / minuteResolution;

  /**
   * Track the prefix and catalog number of the course whose details should be shown.
   */
  const [currentPopover, setCurrentPopover] = useState('');
  return (
    <WeekBlock
      firstHour={firstHour}
      numRows={numRows}
      numColumns={days.length}
      rowHeight={rowHeight}
      minuteResolution={minuteResolution}
      onClick={() => {
        setCurrentPopover(null);
      }}
    >
      {days.map((day, col) => (
        <DayBlock
          key={day}
          column={col}
          heading={day}
          numRows={numRows}
          rowHeight={rowHeight}
        >
          {schedule
            .reduce<SessionBlock[]>((blocks, {
            id: sessionId,
            coursePrefix,
            startHour,
            startMinute,
            endHour,
            endMinute,
            duration,
            weekday,
            courses,
          }) => {
            if (dayEnumToString(weekday) === day) {
              const resolvedStartRow = Math.round(
              // Convert the start time and duration of the course to a
              // css-grid row
                (((startHour - firstHour) * 60) + startMinute)
                / minuteResolution
                // Add one to account for the header row
              ) + 1;
              const resolvedDuration = Math.round(
                duration / minuteResolution
              );
              const popoverInBlock = courses.some(({
                instanceId,
              }) => instanceId === currentPopover);
              return [...blocks, (
                <SessionBlock
                  isFaded={!isPrefixActive(coursePrefix)}
                  isPopoverVisible={!!currentPopover}
                  key={sessionId}
                  prefix={coursePrefix}
                  startRow={resolvedStartRow}
                  duration={resolvedDuration}
                  popovers={
                    courses.map(({
                      id: meetingId,
                      instanceId,
                      courseNumber,
                      room,
                    }, listIndex) => {
                      const displayStartTime = PGTime.toDisplay(
                        `${startHour}:${startMinute.toString().padStart(2, '0')}`
                      );
                      const displayEndTime = PGTime.toDisplay(
                        `${endHour}:${endMinute.toString().padStart(2, '0')}`
                      );
                      return (
                        <Popover
                          key={`${meetingId}-popover`}
                          aria-hidden
                          xOffset="0.5rem"
                          yOffset={`-${2 + listIndex}rem`}
                          title={`${coursePrefix} ${courseNumber}`}
                          isVisible={currentPopover === instanceId}
                        >
                          <p>{day}</p>
                          <p>{`${displayStartTime} - ${displayEndTime}`}</p>
                          <p>{room}</p>
                        </Popover>
                      );
                    })
                  }
                >
                  {courses.map(({
                    id: meetingId,
                    instanceId,
                    courseNumber,
                    room,
                    isUndergraduate,
                  }) => {
                    const catalogNumber = `${coursePrefix} ${courseNumber}`;
                    const displayStartTime = PGTime.toDisplay(
                      `${startHour}:${startMinute.toString().padStart(2, '0')}`
                    );
                    const displayEndTime = PGTime.toDisplay(
                      `${endHour}:${endMinute.toString().padStart(2, '0')}`
                    );
                    const isSelectedCoursePrefix = isPrefixActive(coursePrefix);
                    const isSelected = currentPopover === instanceId;
                    const isSelectedDegreeProgram = (
                      degreeProgram === DEGREE_PROGRAM.BOTH
                        || (isUndergraduate
                          && degreeProgram === DEGREE_PROGRAM.UNDERGRADUATE)
                        || (!isUndergraduate
                          && degreeProgram === DEGREE_PROGRAM.GRADUATE));
                    return (
                      <CourseListing key={meetingId}>
                        <CourseListingButton
                          isHighlighted={popoverInBlock && isSelected}
                          disabled={
                            !isSelectedDegreeProgram
                            || (popoverInBlock && !isSelected)
                            || !isPrefixActive(coursePrefix)
                          }
                          aria-disabled
                          aria-labelledby={`${meetingId}-description`}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (
                              isSelectedDegreeProgram && isSelectedCoursePrefix
                            ) {
                              setCurrentPopover((current) => (
                                current === instanceId ? null : instanceId
                              ));
                            }
                          }}
                        >
                          {courseNumber}
                        </CourseListingButton>
                        <HiddenText id={`${meetingId}-description`}>
                          {`${catalogNumber} on ${day}, ${displayStartTime} to ${displayEndTime} in ${room}`}
                        </HiddenText>
                      </CourseListing>
                    );
                  })}
                </SessionBlock>
              )];
            }
            return blocks;
          }, [])}
        </DayBlock>
      ))}
    </WeekBlock>
  );
};

ScheduleView.defaultProps = {
  minuteResolution: 5,
  rowHeight: '0.5em',
  days: Object.values(DAY).map(dayEnumToString),
  degreeProgram: DEGREE_PROGRAM.BOTH,
};

export default ScheduleView;
