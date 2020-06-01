import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  BaseTheme,
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
  ALIGN,
  LoadSpinner,
} from 'mark-one';
import { ThemeContext } from 'styled-components';
import {
  MESSAGE_TYPE,
  AppMessage,
  MESSAGE_ACTION,
} from 'client/classes';
import { MessageContext } from 'client/context';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { TableHeadProps } from 'mark-one/lib/Tables/TableHead';
import { getMultiYearPlan } from '../../api/multiYearPlan';

const MultiYearPlan: FunctionComponent = function (): ReactElement {
  const [multiYearPlan, setMultiYearPlan] = useState(
    [] as MultiYearPlanResponseDTO[]
  );
  const [fetching, setFetching] = useState(false);

  const dispatchMessage = useContext(MessageContext);
  const theme: BaseTheme = useContext(ThemeContext);

  /*
  * Sort MultiYearPlanResponse by instances
  *
  const sortmultiYearPlanInstances = (mYP: MultiYearPlanResponseDTO[]):
  MultiYearPlanResponseDTO[] => {
    mYP.map(courseInst => (
      courseInst.instances.sort((a, b) => (
        parseInt(a.calendarYear) - parseInt(b.calendarYear)
          ? parseInt(a.calendarYear) - parseInt(b.calendarYear)
          : parseInt(a.academicYear) - parseInt(b.academicYear)
      ))
    ));
    return (mYP);
  };
  */

  useEffect((): void => {
    setFetching(true);
    getMultiYearPlan()
      .then((multiYearPlanList): MultiYearPlanResponseDTO[] => {
        setMultiYearPlan(multiYearPlanList);
        return multiYearPlanList;
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
  }, []);

  let data = (
    <div>
      <LoadSpinner>Fetching Course Data</LoadSpinner>
    </div>
  );

  if (!fetching) {
    let acyear = null;
    if (multiYearPlan.length > 0) {
      const course = multiYearPlan[0];
      acyear = (
        course.instances.map((instance):
        ReactElement<TableHeadProps> => (
          <TableHeadingCell key={instance.id} scope="col">
            {instance.term.slice(0, 1) + '\'' + instance.calendarYear.slice(2, 4) + 'instructors'}
          </TableHeadingCell>
        ))
      );
    }

    const courceInstance = (course) => (
      course.instances.map((instance):
      ReactElement<TableHeadProps> => (
        <TableCell key={instance.id}>
          {
            instance.faculty.length > 0
              ? (instance.faculty.map((f,index) => (<div key={index}> {f.displayName} <br /> </div>)))
              : null
          }
        </TableCell>
      ))
    );

    data = (
      <Table>
        <TableHead>
          <TableRow isStriped>
            <TableHeadingCell scope="col">Area</TableHeadingCell>
            <TableHeadingCell scope="col">CatalogNumber</TableHeadingCell>
            <TableHeadingCell scope="col">Title</TableHeadingCell>
            { acyear }
          </TableRow>
        </TableHead>
        <TableBody isScrollable>
          {multiYearPlan
            .map((course, courseIndex): ReactElement<TableRowProps> => (
              <TableRow isStriped={courseIndex % 2 === 1} key={course.id}>
                <TableCell
                  alignment={ALIGN.CENTER}
                  backgroundColor={
                    (course.area
                      && theme.color.area[course.area.toLowerCase()])
                      ? theme
                        .color
                        .area[course.area.toLowerCase()]
                      : undefined
                  }
                >
                  {course.area}
                </TableCell>
                <TableCell>{course.catalogNumber}</TableCell>
                <TableCell>{course.title}</TableCell>
                {courceInstance(course)}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    );
  }
  return (
    <div className="multi-year-plan">
      {data}
    </div>
  );
};

export default MultiYearPlan;
