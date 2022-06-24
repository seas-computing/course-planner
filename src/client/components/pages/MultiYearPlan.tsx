import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
  LoadSpinner,
  TableRowHeadingCell,
  TableCellList,
  TableCellListItem,
  VALIGN,
  Dropdown,
  TextInput,
} from 'mark-one';
import {
  MESSAGE_TYPE,
  AppMessage,
  MESSAGE_ACTION,
} from 'client/classes';
import { MessageContext, MetadataContext } from 'client/context';
import {
  MultiYearPlanResponseDTO,
} from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { MultiYearPlanAPI } from 'client/api/multiYearPlan';
import { getSemestersFromYear, SemesterInfo } from 'common/utils/multiYearPlanHelperFunctions';
import { getCatPrefixColor } from '../../../common/constants';
import { listFilter } from './Filter';
import { filterPlansByInstructors } from './utils/filterByInstructorValues';
import StyledInstructionalTextBox from '../layout/InstructionalTextBox';

/**
 * The component represents the Multi Year Plan page, which will be rendered at
 * route '/four-year-plan'
 */

const MultiYearPlan: FunctionComponent = (): ReactElement => {
  /**
   * The current list of multi year plans used to populate the
   * Multi Year Plan table
   */
  const [currentMultiYearPlanList, setCurrentMultiYearPlanList] = useState(
    [] as MultiYearPlanResponseDTO[]
  );

  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

  /**
   * The current catalog prefix filter value
   */
  const [catalogPrefixValue, setCatalogPrefixValue] = useState<string>('All');

  /**
   * The current course number filter value
   */
  const [catalogNumberValue, setCatalogNumberValue] = useState<string>('');

  /**
   * The current course title filter value
   */
  const [courseTitleValue, setCourseTitleValue] = useState<string>('');

  /**
   * Keeps track of whether the page is loading
   */
  const [fetching, setFetching] = useState(false);

  const [instructorValues, setInstructorValues] = useState(
    {} as Record<number, string>
  );

  /**
   * Returns filtered multi year plans based on the "Catalog Prefix", "Catalog
   * Number", "Course Title", and a varying number "Instructor" fields based on
   * the number of years of plans that is being shown
   */
  const filteredMultiYearPlans = (): MultiYearPlanResponseDTO[] => {
    let multiYearPlans = [...currentMultiYearPlanList];
    multiYearPlans = listFilter(
      multiYearPlans,
      { field: 'catalogNumber', value: catalogNumberValue, exact: false }
    );
    multiYearPlans = listFilter(
      multiYearPlans,
      { field: 'title', value: courseTitleValue, exact: false }
    );
    multiYearPlans = filterPlansByInstructors(multiYearPlans, instructorValues);
    if (catalogPrefixValue !== 'All') {
      multiYearPlans = listFilter(
        multiYearPlans,
        { field: 'catalogPrefix', value: catalogPrefixValue, exact: false }
      );
    }
    return multiYearPlans;
  };

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  useEffect((): void => {
    setFetching(true);
    MultiYearPlanAPI.getMultiYearPlan()
      .then((multiYearPlanList) => {
        setCurrentMultiYearPlanList(multiYearPlanList);
      })
      .catch((): void => {
        dispatchMessage({
          message: new AppMessage('Unable to get MultiYearPlan', MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
      })
      .finally((): void => {
        setFetching(false);
      });
  }, [dispatchMessage]);

  /**
  * yearsHeaders function take the multi year plan list and create
  * a the semesters headers using the semesters in the first of the
  * multi year plan list.
  */

  const yearsHeaders = (
    myp: MultiYearPlanResponseDTO[],
    semesters: SemesterInfo[]
  ):
  TableHeadingCell[] => (
    // only show headers if we have any rows
    myp.length > 0
      ? semesters
        .map((semester): TableHeadingCell => (
          <TableHeadingCell key={semester.key} scope="col">
            {`${semester.term[0]}'${String(semester.calendarYear).slice(2)} Instructors`}
          </TableHeadingCell>
        ))
      : null
  );

  /**
   * Creates the instructor filters using the multi year plan list
   */
  const instructorFilters = (
    myp: MultiYearPlanResponseDTO[],
    semesters: SemesterInfo[]
  ):
  TableHeadingCell[] => (
    myp.length > 0
      ? semesters
        .map((semester: SemesterInfo, index: number):
        TableHeadingCell => (
          <TableHeadingCell key={semester.key} scope="col">
            <TextInput
              id={`instructorValue${semester.term}${semester.academicYear}`}
              name={`instructorValue${semester.term}${semester.academicYear}`}
              value={instructorValues[index] || ''}
              placeholder="Filter by Instructor"
              label="The table will be filtered as characters are typed in this instructors filter field"
              isLabelVisible={false}
              hideError
              onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                setInstructorValues({
                  ...instructorValues,
                  [index]: event.currentTarget.value,
                });
              }}
            />
          </TableHeadingCell>
        ))
      : null
  );

  /**
  * courseInstance function take a multi year plan object and fill up the
  * instructors of the object semesters.
  */
  const courseInstance = (
    course: MultiYearPlanResponseDTO,
    semesters: SemesterInfo[]
  ): TableCell[] => (
    semesters
      .map((semester: SemesterInfo, index: number): TableCell => {
        const courseSemester = course.semesters[index];
        return (
          <TableCell verticalAlignment={VALIGN.TOP} key={semester.key}>
            <TableCellList>
              {courseSemester && courseSemester.instance.faculty.length > 0
                ? courseSemester.instance.faculty.map((faculty):
                TableCellListItem => (
                  <TableCellListItem key={faculty.id}>
                    {faculty.displayName}
                  </TableCellListItem>
                ))
                : null}
            </TableCellList>
          </TableCell>
        );
      })
  );

  // Calculate the list of semesters once first to avoid recalculation
  const semesters = getSemestersFromYear(metadata.currentAcademicYear);

  const publicHostname = new URL(process.env.PUBLIC_CLIENT_URL).hostname;

  return (
    <div className="multi-year-plan">
      {fetching
        ? (
          <div>
            <LoadSpinner>Fetching Course Data</LoadSpinner>
          </div>
        )
        : (
          <>
            <StyledInstructionalTextBox>
              <p>How to use this site:</p>
              <p>
                This site provides a snapshot of the current and 4-year course
                plan for courses offered by the Harvard School of Engineering
                and Applied Sciences. It also lists some specific courses in
                Earth and Planetary Sciences (EPS) that are typically taught by
                faculty with SEAS appointments.
              </p>
              <p>
                <b>
                  Disclaimer: this course plan can change frequently and
                  should be considered as a tentative, unofficial
                  guideline only.
                </b>
              </p>
              <p>
                <a href="https://courses.my.harvard.edu/" target="_blank" rel="noreferrer">
                  Courses.my.harvard.edu
                </a>
                {' '}
                is the official listing of courses. If a course is blank it
                means it does not have an assigned instructor yet and/or it is
                not planned to be offered.
              </p>
              <p>Direct questions to: seas-course-planner@g.harvard.edu</p>
            </StyledInstructionalTextBox>
            <Table>
              <TableHead>
                <TableRow isStriped>
                  <TableHeadingCell scope="col">Catalog Prefix</TableHeadingCell>
                  <TableHeadingCell scope="col">Catalog Number</TableHeadingCell>
                  <TableHeadingCell scope="col">Title</TableHeadingCell>
                  <>
                    {yearsHeaders(currentMultiYearPlanList, semesters)}
                  </>
                </TableRow>
                <TableRow isStriped>
                  <TableHeadingCell scope="col">
                    <Dropdown
                      options={
                        [{ value: 'All', label: 'All' }]
                          .concat(metadata.catalogPrefixes.map((prefix) => ({
                            value: prefix,
                            label: prefix,
                          })))
                      }
                      value={catalogPrefixValue}
                      name="catalogPrefixValue"
                      id="catalogPrefixValue"
                      label="The table will be filtered as selected in the catalog prefix dropdown filter"
                      isLabelVisible={false}
                      hideError
                      onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                        setCatalogPrefixValue(event.currentTarget.value);
                      }}
                    />
                  </TableHeadingCell>
                  <TableHeadingCell scope="col">
                    <TextInput
                      id="catalogNumberValue"
                      name="catalogNumberValue"
                      value={catalogNumberValue}
                      placeholder="Filter by Catalog Number"
                      label="The table will be filtered as characters are typed in this catalog number filter field"
                      isLabelVisible={false}
                      hideError
                      onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                        setCatalogNumberValue(event.currentTarget.value);
                      }}
                    />
                  </TableHeadingCell>
                  <TableHeadingCell scope="col">
                    <TextInput
                      id="courseTitleValue"
                      name="courseTitleValue"
                      value={courseTitleValue}
                      placeholder="Filter by Course Title"
                      label="The table will be filtered as characters are typed in this course title filter field"
                      isLabelVisible={false}
                      hideError
                      onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                        setCourseTitleValue(event.currentTarget.value);
                      }}
                    />
                  </TableHeadingCell>
                  <>
                    {instructorFilters(currentMultiYearPlanList, semesters)}
                  </>
                </TableRow>
              </TableHead>
              <TableBody isScrollable>
                {filteredMultiYearPlans()
                  .map((course, courseIndex): TableRow => (
                    <TableRow isStriped={courseIndex % 2 === 1} key={course.id}>
                      <TableCell
                        verticalAlignment={VALIGN.TOP}
                        backgroundColor={
                          getCatPrefixColor(course.catalogPrefix)
                        }
                      >
                        {course.catalogPrefix}
                      </TableCell>
                      <TableRowHeadingCell verticalAlignment={VALIGN.TOP} scope="row">
                        {course.catalogNumber}
                      </TableRowHeadingCell>
                      <TableCell verticalAlignment={VALIGN.TOP}>
                        {course.title}
                      </TableCell>
                      <>
                        {courseInstance(course, semesters)}
                      </>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        )}
    </div>
  );
};

export default MultiYearPlan;
