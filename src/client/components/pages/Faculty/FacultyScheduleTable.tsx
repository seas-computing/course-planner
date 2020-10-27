import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableHeadingSpacer,
  ALIGN,
  TableCell,
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderOpen,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { FacultyAbsence, FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { getAreaColor, TERM } from 'common/constants';
import {
  absenceEnumToTitleCase,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
import { MessageContext } from 'client/context';
import { AppMessage, MESSAGE_ACTION, MESSAGE_TYPE } from 'client/classes';
import { FacultyAPI } from 'client/api';
import FacultyAbsenceModal from './FacultyAbsenceModal';

interface FacultyScheduleTableProps {
  /**
   * The academic year of the faculty schedule data being displayed
   */
  academicYear: number;
  /**
   * The faculty schedules to be displayed in the table
   */
  facultySchedules: FacultyResponseDTO[];
}

/**
 * Computes the id of the button for the absence being edited
 */
const computeEditAbsenceButtonId = (faculty: FacultyResponseDTO, term: TERM):
string => `editAbsence${faculty.id}${term}`;

/**
 * Component representing the Faculty Schedules for a given academic year
 */
const FacultyScheduleTable: FunctionComponent<FacultyScheduleTableProps> = ({
  academicYear,
  facultySchedules,
}): ReactElement => {
  /**
   * The current list of schedules used to populate the Faculty Schedule table
   */
  const [currentFacultySchedules, setFacultySchedules] = useState(
    facultySchedules
  );

  /**
   * The currently selected faculty
   */
  const [currentFaculty, setFaculty] = useState(null as FacultyResponseDTO);

  /**
   * The current academic term
   */
  const [currentTerm, setTerm] = useState(null as TERM);

  /**
   * The currently selected absence
   */
  const [currentAbsence, setAbsence] = useState(null as FacultyAbsence);

  /**
   * Keeps track of whether the absence modal is currently visible.
   * By default, the modal is not visible.
   */
  const [absenceModalVisible, setAbsenceModalVisible] = useState(false);

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  const loadSchedules = useCallback(async (): Promise<void> => {
    try {
      setFacultySchedules(await FacultyAPI
        .getFacultySchedulesForYear(academicYear));
    } catch (e) {
      dispatchMessage({
        message: new AppMessage(
          'Unable to get faculty schedule data from server. If the problem persists, contact SEAS Computing',
          MESSAGE_TYPE.ERROR
        ),
        type: MESSAGE_ACTION.PUSH,
      });
    }
  }, [dispatchMessage, academicYear]);
  return (
    <>
      <Table>
        <colgroup>
          <col span={5} />
        </colgroup>
        <colgroup span={2} />
        <colgroup span={2} />
        <colgroup>
          <col />
        </colgroup>
        <TableHead>
          <TableRow noHighlight>
            <TableHeadingSpacer colSpan={5} />
            <TableHeadingCell
              backgroundColor="transparent"
              colSpan={2}
              scope="colgroup"
            >
              {`Fall ${academicYear - 1}`}
            </TableHeadingCell>
            <TableHeadingCell
              backgroundColor="transparent"
              colSpan={2}
              scope="colgroup"
            >
              {`Spring ${academicYear}`}
            </TableHeadingCell>
            <TableHeadingSpacer rowSpan={1} />
          </TableRow>
          <TableRow isStriped>
            <TableHeadingCell scope="col">Area</TableHeadingCell>
            <TableHeadingCell scope="col">Last Name</TableHeadingCell>
            <TableHeadingCell scope="col">First Name</TableHeadingCell>
            <TableHeadingCell scope="col">Category</TableHeadingCell>
            <TableHeadingCell scope="col">Joint With</TableHeadingCell>
            <TableHeadingCell scope="col">Sabbatical Leave</TableHeadingCell>
            <TableHeadingCell scope="col">Courses</TableHeadingCell>
            <TableHeadingCell scope="col">Sabbatical Leave</TableHeadingCell>
            <TableHeadingCell scope="col">Courses</TableHeadingCell>
            <TableHeadingCell scope="col">Detail</TableHeadingCell>
          </TableRow>
        </TableHead>
        <TableBody isScrollable>
          {currentFacultySchedules && currentFacultySchedules
            .map((faculty, facultyIndex): ReactElement<TableRowProps> => (
              <TableRow isStriped={facultyIndex % 2 === 1} key={faculty.id}>
                <TableCell
                  alignment={ALIGN.CENTER}
                  backgroundColor={getAreaColor(faculty.area)}
                >
                  {faculty.area}
                </TableCell>
                <TableCell>{faculty.lastName}</TableCell>
                <TableCell>{faculty.firstName}</TableCell>
                <TableCell>
                  {facultyTypeEnumToTitleCase(faculty.category)}
                </TableCell>
                <TableCell>{faculty.jointWith}</TableCell>
                <TableCell>
                  {absenceEnumToTitleCase(
                    faculty.fall.absence
                      ? faculty.fall.absence.type
                      : ''
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <BorderlessButton
                      id={computeEditAbsenceButtonId(faculty, TERM.FALL)}
                      variant={VARIANT.INFO}
                      onClick={
                        (): void => {
                          setAbsenceModalVisible(true);
                          setFaculty(faculty);
                          setTerm(TERM.FALL);
                          setAbsence(faculty.fall.absence);
                        }
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </BorderlessButton>
                  </div>
                </TableCell>
                <TableCell>
                  {faculty.fall.courses.map((course): ReactElement => (
                    <div key={course.id}>
                      {course.catalogNumber}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {absenceEnumToTitleCase(
                    faculty.spring.absence
                      ? faculty.spring.absence.type
                      : ''
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <BorderlessButton
                      id={computeEditAbsenceButtonId(faculty, TERM.SPRING)}
                      variant={VARIANT.INFO}
                      onClick={
                        (): void => {
                          setAbsenceModalVisible(true);
                          setFaculty(faculty);
                          setTerm(TERM.SPRING);
                          setAbsence(faculty.spring.absence);
                        }
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </BorderlessButton>
                  </div>
                </TableCell>
                <TableCell>
                  {faculty.spring.courses.map((course): ReactElement => (
                    <div key={course.id}>
                      {course.catalogNumber}
                    </div>
                  ))}
                </TableCell>
                <TableCell alignment={ALIGN.CENTER}>
                  <BorderlessButton
                    variant={VARIANT.INFO}
                    onClick={(): void => {}}
                  >
                    <FontAwesomeIcon icon={faFolderOpen} />
                  </BorderlessButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {(currentFaculty && currentAbsence)
        ? (
          <FacultyAbsenceModal
            isVisible={absenceModalVisible}
            currentFaculty={currentFaculty}
            currentAbsence={currentAbsence}
            onClose={(): void => {
              setAbsenceModalVisible(false);
              const buttonId = computeEditAbsenceButtonId(
                currentFaculty,
                currentTerm
              );
              const button = document.getElementById(buttonId);
              // this will run after the data is loaded, so no delay is necessary
              window.setTimeout((): void => {
                button.focus();
              }, 0);
            }}
            onSuccess={async (): Promise<void> => {
              // wait for the table to load before allowing the dialog to close
              await loadSchedules();
            }}
          />
        )
        : (<></>)}
    </>
  );
};

export default FacultyScheduleTable;
