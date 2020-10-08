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
  BorderlessButton,
  VARIANT,
  TextInput,
  Dropdown,
} from 'mark-one';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { MESSAGE_TYPE, AppMessage, MESSAGE_ACTION } from 'client/classes';
import { MessageContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { getAreaColor } from '../../../common/constants';
import { CourseAPI } from '../../api/courses';

/**
 * The component represents the Course Admin page, which will be rendered at
 * route '/course-admin'
 */

const CourseAdmin: FunctionComponent = function (): ReactElement {
  const [currentCourses, setCourses] = useState(
    [] as ManageCourseResponseDTO[]
  );
  const [filterdCourses, setFilterdCourses] = useState(
    [] as ManageCourseResponseDTO[]
  );
  const [prefixOptions, setPrefixOptions] = useState([]);
  const [courseValue, setCourseValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [coursePrefixValue, setCoursePrefixValue] = useState('');

  /**
   * Extract the "Course Prefix" unique values
   * from the course DTO area name
   */
  const coursePrefixSetup = (courses) => {
    let initPrefixOptions = courses.map(
      (course) => ({ value: course.area.name, label: course.area.name })
    );
    const vkey = 'value';
    initPrefixOptions = [...new Map(initPrefixOptions.map(item => [item[vkey], item])).values()];
    initPrefixOptions.push({ value: '', label: '' });
    setPrefixOptions(initPrefixOptions);
    setCoursePrefixValue('');
  };

  /**
   * Filter on the "Course" field.
   * Include "Course Prefix" and "Title" filters if
   * filter on those fields present.
   */
  const handleCourseFilter = (event) => {
    let courses = [...currentCourses];
    setCourseValue(event.target.value);
    if (titleValue) {
      courses = courses.filter(
        (course) => course.title.includes(titleValue)
      );
    }
    if (coursePrefixValue) {
      courses = courses.filter(
        (course) => course.area.name === coursePrefixValue
      );
    }  
    courses = courses.filter(
      (course) => course.catalogNumber.includes(event.target.value)
    );
    setFilterdCourses(courses);
  }

  /**
   * Filter on the "Title" field.
   * Include "Course Prefix" and "Course" filters if
   * filter on those fields present.
   */
  const handleTitleFilter = (event) => {
    let courses = [...currentCourses];
    setTitleValue(event.target.value);
    if (courseValue) {
      courses = courses.filter(
        (course) => course.catalogNumber.includes(courseValue)
      );
    }
    if (coursePrefixValue) {
      courses = courses.filter(
        (course) => course.area.name === coursePrefixValue
      );
    }  
    courses = courses.filter(
      (course) => course.title.includes(event.target.value)
    );
    setFilterdCourses(courses);
  }

  /**
   * Filter on the "Course Prefix" field.
   * Include "Course" and "Title" filters if
   * filter on those fields present.
   */
  const handleCoursePrefixFilter = (event) => {
    let courses = [...currentCourses];
    setCoursePrefixValue(event.target.value);
    if (courseValue) {
      courses = courses.filter(
        (course) => course.catalogNumber.includes(courseValue)
      );
    }
    if (titleValue) {
      courses = courses.filter(
        (course) => course.title.includes(titleValue)
      );
    }
    if (event.target.value){
      courses = courses.filter(
        (course) => course.area.name === event.target.value
      );
    }
    setFilterdCourses(courses);
  }

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Gets the course data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    CourseAPI.getAllCourses()
      .then((courses): ManageCourseResponseDTO[] => {
        setCourses(courses);
        setFilterdCourses(courses);
        coursePrefixSetup(courses);
        return courses;
      })
      .catch((): void => {
        dispatchMessage({
          message: new AppMessage(
            'Unable to get course data from server. If the problem persists, contact SEAS Computing',
            MESSAGE_TYPE.ERROR
          ),
          type: MESSAGE_ACTION.PUSH,
        });
      });
  }, [dispatchMessage]);

  return (
    <div className="course-admin-table">
      <Table>
        <TableHead>
          <TableRow isStriped>
            <TableHeadingCell scope="col">Course Prefix</TableHeadingCell>
            <TableHeadingCell scope="col">Course</TableHeadingCell>
            <TableHeadingCell scope="col">Title</TableHeadingCell>
            <TableHeadingCell scope="col">Edit</TableHeadingCell>
          </TableRow>
          <TableRow isStriped>
            <TableHeadingCell scope="col">
              <Dropdown
                options={prefixOptions}
                value={coursePrefixValue}
                name="courseprefix"
                id="coursePrefix"
                label=""
                onChange={(event) => { handleCoursePrefixFilter(event) }}
              />
            </TableHeadingCell>
            <TableHeadingCell scope="col">
              <TextInput
                value={courseValue}
                placeholder="Filter by course"
                name="course"
                id="course"
                label=""
                onChange={(event) => { handleCourseFilter(event) }}
              />
            </TableHeadingCell>
            <TableHeadingCell scope="col">
              <TextInput
                value={titleValue}
                placeholder="Filter by Title"
                name="title"
                id="title"
                label=""
                onChange={(event) => { handleTitleFilter(event) }}
              />
            </TableHeadingCell>
            <TableHeadingCell scope="col"> </TableHeadingCell>
          </TableRow>
        </TableHead>
        <TableBody isScrollable>
          {filterdCourses.map((course, i): ReactElement<TableRowProps> => (
            <TableRow isStriped={i % 2 === 1} key={course.id}>
              <TableCell
                backgroundColor={getAreaColor(course.area.name)}
              >
                {course.area.name}
              </TableCell>
              <TableCell>{course.catalogNumber}</TableCell>
              <TableCell>{course.title}</TableCell>
              <TableCell>
                <BorderlessButton
                  variant={VARIANT.INFO}
                  onClick={(): void => {}}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseAdmin;
