import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadingCell,
  TableCell,
  TableHeadingSpacer,
  TableCellList,
  TableCellListItem,
  BorderlessButton,
  VARIANT,
  fromTheme,
} from 'mark-one';
import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import { getAreaColor } from 'common/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { dayEnumToString } from 'common/constants/day';
import styled from 'styled-components';
import { CampusIcon, CellLayout } from 'client/components/general';

interface NonClassMeetingsTableProps {
  /**
   * The list of entries to be shown in the table
   */
  nonClassMeetingList: NonClassMeetingResponseDTO[];
  /**
   * The Academic Year of the data currently being displayed
   */
  academicYear: number;
}

/**
 * Utility component to style the data about a meeting
 */
const MeetingGrid = styled.div`
 display: grid;
 grid-template-areas: "time campus room";
 grid-template-columns: 2fr 2em 3fr 2em;
 column-gap: ${fromTheme('ws', 'xsmall')};
 align-items: baseline;
`;

/**
* Handles the placement of a single piece of the meeting data
*/

const MeetingGridSection = styled.div<{area: string}>`
 grid-area: ${({ area }): string => area};
 display: flex;
 flex-direction: column;
 align-items: flex-start;
`;

/**
 * Component representing the list of CourseInstances in a given Academic year
 */
const NonClassMeetingsTable: FunctionComponent<NonClassMeetingsTableProps> = ({
  academicYear,
  nonClassMeetingList,
}): ReactElement => (
  <Table>
    <TableHead>
      <TableRow noHighlight>
        <TableHeadingSpacer colSpan={5} />
        <TableHeadingCell
          backgroundColor="transparent"
          colSpan="1"
          scope="colgroup"
        >
          Fall
          {' ' + (academicYear - 1).toString()}
        </TableHeadingCell>
        <TableHeadingCell
          backgroundColor="transparent"
          colSpan="1"
          scope="colgroup"
        >
          Spring
          {' ' + academicYear.toString()}
        </TableHeadingCell>
      </TableRow>
      <TableRow isStriped>
        <TableHeadingCell key="area">Area</TableHeadingCell>
        <TableHeadingCell key="title">Title</TableHeadingCell>
        <TableHeadingCell key="expectedSize">Expected Size</TableHeadingCell>
        <TableHeadingCell key="notes">Notes</TableHeadingCell>
        <TableHeadingCell key="contactInfo">Contact Info</TableHeadingCell>
        <TableHeadingCell key="springRoom">Room</TableHeadingCell>
        <TableHeadingCell key="fallRoom">Room</TableHeadingCell>
        <TableHeadingCell key="detail">Detail</TableHeadingCell>
        <TableHeadingCell key="editMeeting">Edit Meeting</TableHeadingCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {
        nonClassMeetingList.map(({
          id,
          area,
          title,
          expectedSize,
          notes,
          contactEmail,
          contactName,
          contactPhone,
          spring,
          fall,
        }, index) => (
          <TableRow isStriped={index % 2 !== 0} key={id}>
            <TableCell backgroundColor={getAreaColor(area)} key={`area-${id}`}>{area}</TableCell>
            <TableCell key={`title-${id}`}>{title}</TableCell>
            <TableCell key={`expectedSize-${id}`}>{expectedSize}</TableCell>
            <TableCell key={`notes-${id}`}>{notes}</TableCell>
            <TableCell key={`contactInfo-${id}`}>
              {
                /*
                  * This is being used instead of just outputting the fields
                  * directly as a way to filter out any null values. This
                  * ensures that if a phone number, name or email is missing
                  * we don't end up with blank lines where the "<br />"s still
                  * are, but with no data before them.
                  *
                  * The same result could be accomplished with lots of ternary
                  * logic, but this felt like a cleaner (and more scalable) way
                  * to solve the problem.
                  */
                [
                  contactName,
                  contactEmail,
                  contactPhone,
                ]
                  .filter((info) => !!info)
                  .map((info) => (
                    <>
                      {info}
                      <br />
                    </>
                  ))
              }
            </TableCell>
            <TableCell key={`fallMeetings-${id}`}>
              <CellLayout>
                <TableCellList>
                  {fall.meetings.map(({
                    id: meetingId,
                    day,
                    startTime,
                    endTime,
                    room,
                  }) => (
                    <TableCellListItem key={meetingId}>
                      <MeetingGrid>
                        <MeetingGridSection area="time">
                          <div>{dayEnumToString(day)}</div>
                          <div>{`${startTime}-${endTime}`}</div>
                        </MeetingGridSection>
                        {room && (
                          <>
                            <MeetingGridSection area="room">
                              {room.name}
                            </MeetingGridSection>
                            <MeetingGridSection area="campus">
                              <CampusIcon>{room.campus}</CampusIcon>
                            </MeetingGridSection>
                          </>
                        )}
                      </MeetingGrid>
                    </TableCellListItem>
                  ))}
                </TableCellList>
                <BorderlessButton
                  id={`${id}-${spring.term}-edit-meetings-button`}
                  key={`${id}-${spring.term}-edit-meetings-button`}
                  onClick={() => {}}
                  variant={VARIANT.INFO}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </CellLayout>
            </TableCell>
            <TableCell key={`springMeetings-${id}`}>
              <CellLayout>
                <TableCellList>
                  {spring.meetings.map(({
                    id: meetingId,
                    day,
                    startTime,
                    endTime,
                    room,
                  }) => (
                    <TableCellListItem key={meetingId}>
                      <MeetingGrid>
                        <MeetingGridSection area="time">
                          <div>{dayEnumToString(day)}</div>
                          <div>{`${startTime}-${endTime}`}</div>
                        </MeetingGridSection>
                        {room && (
                          <>
                            <MeetingGridSection area="room">
                              {room.name}
                            </MeetingGridSection>
                            <MeetingGridSection area="campus">
                              <CampusIcon>{room.campus}</CampusIcon>
                            </MeetingGridSection>
                          </>
                        )}
                      </MeetingGrid>
                    </TableCellListItem>
                  ))}
                </TableCellList>
                <BorderlessButton
                  id={`${id}-${spring.term}-edit-meetings-button`}
                  key={`${id}-${spring.term}-edit-meetings-button`}
                  onClick={() => {}}
                  variant={VARIANT.INFO}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </CellLayout>
            </TableCell>
            <TableCell>
              <BorderlessButton
                onClick={() => {}}
                variant={VARIANT.INFO}
              >
                <FontAwesomeIcon icon={faFolderOpen} />
              </BorderlessButton>
            </TableCell>
            <TableCell>
              <BorderlessButton
                onClick={() => {}}
                variant={VARIANT.INFO}
              >
                <FontAwesomeIcon icon={faEdit} />
              </BorderlessButton>
            </TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  </Table>
);

export default NonClassMeetingsTable;
