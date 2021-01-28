import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  ALIGN,
  Button,
  Dropdown,
  TextInput,
} from 'mark-one';
import {
  MESSAGE_TYPE,
  AppMessage,
  MESSAGE_ACTION,
} from 'client/classes';
import { MessageContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { MetadataContext } from 'client/context/MetadataContext';
import { getAreaColor } from '../../../common/constants';
import { FacultyAPI } from '../../api/faculty';
import FacultyModal from './FacultyModal';
import { VerticalSpace } from '../layout';
import { listFilter } from './Filter';

/**
 * Computes the id of the faculty button for the faculty being edited
 */
const computeEditFacultyButtonId = (faculty: ManageFacultyResponseDTO):
string => `editFaculty${faculty.id}`;

/**
 * The component represents the Faculty Admin page, which will be rendered at
 * route '/faculty-admin'
 */

const FacultyAdmin: FunctionComponent = (): ReactElement => {
  /**
   * The current list of faculty members used to populate the Faculty Admin table
   */
  const [currentFacultyMembersList, setCurrentFacultyMembersList] = useState(
    [] as ManageFacultyResponseDTO[]
  );

  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

  /**
   * Keeps track of whether the faculty modal is currently visible.
   * By default, the modal is not visible.
   */
  const [
    facultyModalVisible,
    setFacultyModalVisible,
  ] = useState(false);

  /**
   * The currently selected faculty
   */
  const [
    currentFaculty,
    setCurrentFaculty,
  ] = useState(null as ManageFacultyResponseDTO);

  /**
   * The current area filter value
   */
  const [facultyAreaValue, setFacultyAreaValue] = useState<string>('All');

  /**
   * The current HUID filter value
   */
  const [HUIDValue, setHUIDValue] = useState<string>('');

  /**
   * The current last name filter value
   */
  const [lastNameValue, setLastNameValue] = useState<string>('');

  /**
   * The current first name filter value
   */
  const [firstNameValue, setFirstNameValue] = useState<string>('');

  /**
   * Return filtered faculty members based on the "Area", "HUID", "Last Name",
   * and "First Name" fields filters
   */
  const filteredFaculty = (): ManageFacultyResponseDTO[] => {
    let facultyMembers = [...currentFacultyMembersList];
    facultyMembers = listFilter(
      facultyMembers,
      { field: 'HUID', value: HUIDValue, exact: false }
    );
    facultyMembers = listFilter(
      facultyMembers,
      { field: 'lastName', value: lastNameValue, exact: false }
    );
    facultyMembers = listFilter(
      facultyMembers,
      { field: 'firstName', value: firstNameValue, exact: false }
    );
    if (facultyAreaValue !== 'All') {
      facultyMembers = listFilter(
        facultyMembers,
        { field: 'area.name', value: facultyAreaValue, exact: true }
      );
    }
    return facultyMembers;
  };

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  const loadFaculty = useCallback(async (): Promise<void> => {
    try {
      const facultyList = await FacultyAPI.getAllFacultyMembers();
      setCurrentFacultyMembersList(facultyList);
    } catch (e) {
      dispatchMessage({
        message: new AppMessage(
          'Unable to get faculty data from server. If the problem persists, contact SEAS Computing',
          MESSAGE_TYPE.ERROR
        ),
        type: MESSAGE_ACTION.PUSH,
      });
    }
  }, [dispatchMessage]);

  /**
   * Gets the faculty data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    void loadFaculty();
  }, [loadFaculty]);

  return (
    <>
      <VerticalSpace>
        <div className="create-faculty-button">
          <Button
            id="createFaculty"
            onClick={
              (): void => {
                setCurrentFaculty(null);
                setFacultyModalVisible(true);
              }
            }
            variant={VARIANT.INFO}
          >
            Create New Faculty
          </Button>
        </div>
      </VerticalSpace>
      <div className="faculty-admin-table">
        <Table>
          <TableHead>
            <TableRow isStriped>
              <TableHeadingCell scope="col">Area</TableHeadingCell>
              <TableHeadingCell scope="col">HUID</TableHeadingCell>
              <TableHeadingCell scope="col">Last Name</TableHeadingCell>
              <TableHeadingCell scope="col">First Name</TableHeadingCell>
              <TableHeadingCell scope="col">Edit</TableHeadingCell>
            </TableRow>
            <TableRow isStriped>
              <TableHeadingCell scope="col">
                <Dropdown
                  options={
                    [{ value: 'All', label: 'All' }]
                      .concat(metadata.areas.map((area) => ({
                        value: area,
                        label: area,
                      })))
                  }
                  value={facultyAreaValue}
                  name="facultyArea"
                  id="facultyArea"
                  label="The table will be filtered as selected in the faculty area dropdown filter"
                  isLabelVisible={false}
                  hideError
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                    setFacultyAreaValue(event.currentTarget.value);
                  }}
                />
              </TableHeadingCell>
              <TableHeadingCell scope="col">
                <TextInput
                  id="huid"
                  name="huid"
                  value={HUIDValue}
                  placeholder="Filter by HUID"
                  label="The table will be filtered as characters are typed in this HUID filter field"
                  isLabelVisible={false}
                  hideError
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                    setHUIDValue(event.currentTarget.value);
                  }}
                />
              </TableHeadingCell>
              <TableHeadingCell scope="col">
                <TextInput
                  id="lastName"
                  name="lastName"
                  value={lastNameValue}
                  placeholder="Filter by Last Name"
                  label="The table will be filtered as characters are typed in this last name filter field"
                  isLabelVisible={false}
                  hideError
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                    setLastNameValue(event.currentTarget.value);
                  }}
                />
              </TableHeadingCell>
              <TableHeadingCell scope="col">
                <TextInput
                  id="firstName"
                  name="firstName"
                  value={firstNameValue}
                  placeholder="Filter by First Name"
                  label="The table will be filtered as characters are typed in this first name filter field"
                  isLabelVisible={false}
                  hideError
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                    setFirstNameValue(event.currentTarget.value);
                  }}
                />
              </TableHeadingCell>
              <TableHeadingCell scope="col"> </TableHeadingCell>
            </TableRow>
          </TableHead>
          <TableBody isScrollable>
            {filteredFaculty()
              .map((faculty, facultyIndex): ReactElement<TableRowProps> => (
                <TableRow isStriped={facultyIndex % 2 === 1} key={faculty.id}>
                  <TableCell
                    alignment={ALIGN.CENTER}
                    backgroundColor={getAreaColor(faculty.area.name)}
                  >
                    {faculty.area && faculty.area.name}
                  </TableCell>
                  <TableCell alignment={ALIGN.CENTER}>{faculty.HUID}</TableCell>
                  <TableCell>{faculty.lastName}</TableCell>
                  <TableCell>{faculty.firstName}</TableCell>
                  <TableCell alignment={ALIGN.CENTER}>
                    <BorderlessButton
                      id={computeEditFacultyButtonId(faculty)}
                      variant={VARIANT.INFO}
                      onClick={
                        (): void => {
                          setCurrentFaculty(faculty);
                          setFacultyModalVisible(true);
                        }
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </BorderlessButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <FacultyModal
          isVisible={facultyModalVisible}
          currentFaculty={currentFaculty}
          onClose={(): void => {
            if (currentFaculty) {
              setFacultyModalVisible(false);
              const buttonId = computeEditFacultyButtonId(currentFaculty);
              const button = document.getElementById(buttonId);
              // this will run after the data is loaded, so no delay is necessary
              window.setTimeout((): void => {
                button.focus();
              }, 0);
            } else {
              setFacultyModalVisible(false);
              window.setTimeout((): void => document.getElementById('createFaculty').focus(), 0);
            }
          }}
          onSuccess={async (): Promise<void> => {
            // wait for the faculty to load before allowing the dialog to close
            await loadFaculty();
          }}
        />
      </div>
    </>
  );
};

export default FacultyAdmin;
