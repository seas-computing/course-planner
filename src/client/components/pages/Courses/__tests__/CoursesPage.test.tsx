import React from 'react';
import { strictEqual, deepStrictEqual } from 'assert';
import {
  stub,
  spy,
  SinonStub,
  SinonSpy,
} from 'sinon';
import {
  render,
  BoundFunction,
  QueryByText,
  FindByText,
  wait,
  fireEvent,
  AllByRole,
  within,
} from 'test-utils';
import { CourseAPI } from 'client/api';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MessageReducerAction, MetadataContextValue } from 'client/context';
import * as dummy from 'testData';
import { am105CourseInstance, cs50CourseInstance } from 'testData';
import {
  isSEASEnumToString,
  IS_SEAS,
  OFFERED,
  TERM,
} from 'common/constants';
import { offeredEnumToString } from 'common/constants/offered';
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers';
import CoursesPage from '../CoursesPage';
import * as filters from '../../Filter';
import * as instructorFilters from '../../utils/filterByInstructorValues';

describe('Course Page', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  let listFilterSpy: SinonSpy;
  let filterInstructorsSpy: SinonSpy;
  let clock: InstalledClock;
  const currentAcademicYear = 2021;
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    dispatchMessage = stub();
  });
  describe('fetching data on render', function () {
    context('When API request succeeds', function () {
      let findByText: BoundFunction<FindByText>;
      beforeEach(function () {
        getStub.resolves([
          { ...cs50CourseInstance },
        ]);
        ({ findByText } = render(<CoursesPage />));
      });
      it('calls the fetch function on render', function () {
        strictEqual(getStub.callCount, 1);
      });
      // TODO: Test "showRetired" when implemented
      // TODO: Test custom views when implemented
      it('renders the data in the table', async function () {
        await findByText('CS 050');
      });
    });
    context('When API request fails', function () {
      let queryByText: BoundFunction<QueryByText>;
      const errorMessage = 'Failed to retrieve course data';
      beforeEach(function () {
        getStub.rejects(new Error(errorMessage));
        ({ queryByText } = render(<CoursesPage />, { dispatchMessage }));
      });
      it('Should call the dispatchMessage function', async function () {
        await wait(() => queryByText('Fetching') === null);
        strictEqual(dispatchMessage.callCount, 1);
      });
      it('Should include an error message describing the issue', async function () {
        await wait(() => queryByText('Fetching') === null);
        const testErrorAppMessage = new AppMessage(
          errorMessage,
          MESSAGE_TYPE.ERROR
        );
        const realMessage = dispatchMessage.args[0][0] as MessageReducerAction;
        deepStrictEqual(realMessage.message, testErrorAppMessage);
        strictEqual(realMessage.type, MESSAGE_ACTION.PUSH);
      });
    });
  });
  describe('Navigating Academic Years', function () {
    let metadataContext: MetadataContextValue;
    beforeEach(function () {
      getStub.resolves([
        { ...cs50CourseInstance },
      ]);
      metadataContext = new MetadataContextValue({
        ...dummy.metadata,
        currentAcademicYear,
        semesters: [
          `${TERM.FALL} 2020`,
          `${TERM.SPRING} 2021`,
          `${TERM.FALL} 2021`,
          `${TERM.SPRING} 2022`,
        ],
      },
      spy());
    });
    it('requests data for the current academic year on initial render', function () {
      render(
        <CoursesPage />,
        { metadataContext }
      );
      strictEqual(getStub.args[0][0], currentAcademicYear);
    });
    it('Populates the academic year dropdown', function () {
      const { getByLabelText } = render(
        <CoursesPage />,
        { metadataContext }
      );
      const academicYearDropdown = getByLabelText('Academic Year');
      const dropdownOptions = within(academicYearDropdown)
        .getAllByRole('option') as HTMLOptionElement[];
      const dropdownLabels = dropdownOptions
        .map(({ textContent }) => textContent);
      deepStrictEqual(
        dropdownLabels,
        [
          'Fall 2020 - Spring 2021',
          'Fall 2021 - Spring 2022',
        ]
      );
      const dropdownValues = dropdownOptions
        .map(({ value }) => value);
      deepStrictEqual(
        dropdownValues,
        ['2021', '2022']
      );
    });
    it('Fetches new data when changing academic years', function () {
      const nextAcademicYear = currentAcademicYear + 1;
      const { getByLabelText } = render(
        <CoursesPage />,
        { metadataContext }
      );
      strictEqual(getStub.args[0][0], currentAcademicYear);
      fireEvent.change(
        getByLabelText('Academic Year'),
        {
          target: {
            value: `${nextAcademicYear}`,
          },
        }
      );
      strictEqual(getStub.args[1][0], nextAcademicYear);
    });
  });
  describe('Filtering data', function () {
    let getAllByRole: BoundFunction<AllByRole>;
    let findByText: BoundFunction<FindByText>;
    const areaFilterLabel = 'The table will be filtered as selected in this area dropdown filter';
    const isSEASFilterLabel = 'The table will be filtered as selected in this isSEAS dropdown filter';
    const fallOfferedFilterLabel = 'The table will be filtered as selected in this fall offered dropdown filter';
    const springOfferedFilterLabel = 'The table will be filtered as selected in this spring offered dropdown filter';
    const catalogNumberLabel = 'The table will be filtered as characters are typed in this catalogNumber filter field';
    const titleLabel = 'The table will be filtered as characters are typed in this title filter field';
    const fallInstructorsFilterLabel = 'The table will be filtered as characters are typed in this fall instructors filter field';
    const springInstructorsFilterLabel = 'The table will be filtered as characters are typed in this spring instructors filter field';
    beforeEach(function () {
      listFilterSpy = spy(filters, 'listFilter');
      filterInstructorsSpy = spy(instructorFilters, 'filterCoursesByInstructors');
      getStub.resolves([
        { ...cs50CourseInstance },
        { ...am105CourseInstance },
      ]);
      ({ getAllByRole, findByText } = render(<CoursesPage />));
      clock = FakeTimers.install({
        toFake: ['setTimeout'],
      });
    });
    afterEach(function () {
      clock.uninstall();
    });
    context('when the area dropdown filter is changed', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const area = utils.getByLabelText(areaFilterLabel);
        listFilterSpy.resetHistory();
        fireEvent.change(area, { target: { value: 'AM' } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(listFilterSpy.callCount, 1);
      });
    });
    context('when the isSEAS dropdown filter is called', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const isSEAS = utils.getByLabelText(isSEASFilterLabel);
        listFilterSpy.resetHistory();
        fireEvent.change(isSEAS,
          { target: { value: isSEASEnumToString(IS_SEAS.N) } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(listFilterSpy.callCount, 1);
      });
    });
    context('when the fall offered dropdown filter is called', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const fallOffered = utils.getByLabelText(fallOfferedFilterLabel);
        listFilterSpy.resetHistory();
        fireEvent.change(fallOffered,
          { target: { value: offeredEnumToString(OFFERED.Y) } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(listFilterSpy.callCount, 1);
      });
    });
    context('when the spring offered dropdown filter is called', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const springOffered = utils.getByLabelText(springOfferedFilterLabel);
        listFilterSpy.resetHistory();
        fireEvent.change(springOffered,
          { target: { value: offeredEnumToString(OFFERED.N) } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(listFilterSpy.callCount, 1);
      });
    });
    context('when the catalogNumber text filter is called', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const catalogNumber = utils.getByLabelText(catalogNumberLabel);
        listFilterSpy.resetHistory();
        fireEvent.change(catalogNumber,
          { target: { value: 'CS' } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(listFilterSpy.callCount, 1);
      });
    });
    context('when the title text filter is called', function () {
      it('calls the listFilter function once for each filter', async function () {
        // Since the title column is not shown in the default view, the view must be updated
        const customizeViewButton = await findByText('Customize View', { exact: false });
        fireEvent.click(customizeViewButton);
        const modal = getAllByRole('dialog')[0];
        const titleCheckbox = await within(modal)
          .findByLabelText('Title');
        fireEvent.click(titleCheckbox);
        const doneButton = within(modal).getByText('Done');
        fireEvent.click(doneButton);
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const title = utils.getByLabelText(titleLabel);
        listFilterSpy.resetHistory();
        fireEvent.change(title,
          { target: { value: 'AM 105' } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(listFilterSpy.callCount, 1);
      });
    });
    context('when the fall instructors text filter is called', function () {
      it('calls the filterInstructorsSpy function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const fallInstructors = utils
          .getByLabelText(fallInstructorsFilterLabel);
        filterInstructorsSpy.resetHistory();
        fireEvent.change(fallInstructors,
          { target: { value: 'Malan' } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(filterInstructorsSpy.callCount, 1);
      });
    });
    context('when the spring instructors text filter is called', function () {
      it('calls the filterInstructorsSpy function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const springInstructors = utils
          .getByLabelText(springInstructorsFilterLabel);
        filterInstructorsSpy.resetHistory();
        fireEvent.change(springInstructors,
          { target: { value: 'Waldo' } });
        // Filter changes are debounced within 100 ms of changes, so we are using
        // a fake time to make 200 ms pass after changing the filter value.
        clock.tick(200);
        strictEqual(filterInstructorsSpy.callCount, 1);
      });
    });
  });
  describe('customize button', function () {
    let findByText: BoundFunction<FindByText>;
    let queryAllByRole: BoundFunction<AllByRole>;
    beforeEach(function () {
      getStub.resolves([
        { ...cs50CourseInstance },
      ]);
      ({
        findByText,
        queryAllByRole,
      } = render(<CoursesPage />));
    });
    it('causes ViewModal to be displayed', async function () {
      const customizeButton = await findByText(/Customize/, { exact: true });

      fireEvent.click(customizeButton);

      strictEqual(queryAllByRole('dialog').length, 1);
    });
  });
});
