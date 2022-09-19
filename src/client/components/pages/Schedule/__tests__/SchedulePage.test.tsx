import React from 'react';
import {
  render,
  waitForElementToBeRemoved,
  within,
  RenderResult,
  fireEvent,
} from 'test-utils';
import {
  stub,
  SinonStub,
} from 'sinon';
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers';
import * as CourseAPI from 'client/api/courses';
import { strictEqual, deepStrictEqual } from 'assert';
import * as dummy from 'testData';
import { MetadataContextValue } from 'client/context/MetadataContext';
import { DEGREE_PROGRAM, TERM } from 'common/constants';
import SchedulePage from '../SchedulePage';
import ScheduleView from '../ScheduleView';
import { testCourseScheduleData } from 'testData';
import { assert } from 'console';
import { Equal } from 'typeorm';

describe('Schedule Page', function () {
  let dispatchMessage: SinonStub;
  let apiStub: SinonStub;
  const testAcademicYear = 1999;
  let clock: InstalledClock;
  const metadata = new MetadataContextValue(
    {
      ...dummy.metadata,
      currentAcademicYear: testAcademicYear,
      semesters: [
        ...dummy.metadata.semesters,
        `${TERM.SPRING} ${testAcademicYear}`,
        `${TERM.FALL} ${testAcademicYear}`,
      ],
    },
    () => {}
  );
  beforeEach(function () {
    dispatchMessage = stub();
    apiStub = stub(CourseAPI, 'getCourseScheduleForSemester');
  });
  afterEach(function () {
    apiStub.restore();
  });
  describe('Semester Dropdown', function () {
    let renderResult: RenderResult;
    beforeEach(function () {
      apiStub.resolves(testCourseScheduleData);
      const fakeDate = new Date(testAcademicYear, 5, 30);
      clock = FakeTimers.install({
        toFake: ['Date'],
      });
      clock.tick(fakeDate.valueOf());
      renderResult = render(
        <SchedulePage />,
        { metadataContext: metadata }
      );
    });
    afterEach(function () {
      clock.uninstall();
    });
    it('renders the list of existing semesters', function () {
      const { semesters: metadataSemesters } = metadata;
      const { getByLabelText } = renderResult;
      const dropdown = getByLabelText(/semester/i);
      const options = within(dropdown).getAllByRole('option')
        .map(({ value }: HTMLOptionElement) => value);

      deepStrictEqual(metadataSemesters, options);
    });
    it('defaults to the current semester', async function () {
      const { getByText, getByLabelText } = renderResult;
      await waitForElementToBeRemoved(() => getByText('Fetching Course Schedule'));
      const dropdown = getByLabelText(/semester/i) as HTMLSelectElement;
      const currentValue = dropdown.value;
      strictEqual(currentValue, `${TERM.SPRING} ${testAcademicYear}`);
    });
    it('requests the selected semester data', async function () {
      const { getByLabelText, getByText } = renderResult;
      const dropdown = getByLabelText(/semester/i) as HTMLSelectElement;
      fireEvent.change(dropdown, { target: { value: `${TERM.FALL} ${testAcademicYear}` } });
      await waitForElementToBeRemoved(() => getByText(
        'Fetching Course Schedule'
      ));
      // check the second call to the API
      const [calendarYear, term] = apiStub.args[1];
      strictEqual(calendarYear, testAcademicYear);
      strictEqual(term, TERM.FALL);
    });
  });
  describe('Degree Program Dropdown', function () {
    let renderResult: RenderResult;
    beforeEach( async function () {
      apiStub.resolves(testCourseScheduleData);
      const fakeDate = new Date(testAcademicYear, 5, 30);
      clock = FakeTimers.install({
        toFake: ['Date'],
      });
      clock.tick(fakeDate.valueOf());
      renderResult = render(
        <SchedulePage />,
        { metadataContext: metadata }
      );
      await waitForElementToBeRemoved(()=> renderResult.getByText('Fetching Course Schedule'))
    });
    afterEach(function () {
      clock.uninstall();
    });
    it('renders the list of degree program options ', function () {
      const { getByLabelText } = renderResult;
      const dropdown = getByLabelText(/Degree Program/i);
      const options = within(dropdown).getAllByRole('option')
        .map(({ value }: HTMLOptionElement) => value);
      const degreeProgramOptions = [
        DEGREE_PROGRAM.BOTH,
        DEGREE_PROGRAM.GRADUATE,
        DEGREE_PROGRAM.UNDERGRADUATE,
      ];
      deepStrictEqual(options, degreeProgramOptions);
    });
  });
  describe('Degree Program Selected', function () {
    let renderResult: RenderResult;
    beforeEach( async function () {
      apiStub.resolves(testCourseScheduleData);
      const fakeDate = new Date(testAcademicYear, 5, 30);
      clock = FakeTimers.install({
        toFake: ['Date'],
      });
      clock.tick(fakeDate.valueOf());
      renderResult = render(
        <SchedulePage />,
        { metadataContext: metadata }
      );
      await waitForElementToBeRemoved(()=> renderResult.getByText('Fetching Course Schedule'))
    });
    afterEach(function () {
      clock.uninstall();
    });
    it('The course program button is not faded when both is selected', () => {
      const { getByLabelText } = renderResult;
      const degreeProgramDropDown = getByLabelText(/Degree Program/i) as HTMLSelectElement;
      const selectedDegreeProgram = degreeProgramDropDown.value;
      fireEvent.change(degreeProgramDropDown, { target: { value: DEGREE_PROGRAM.BOTH } });
      let undergradCourseId= testCourseScheduleData[0].courses[0].id
      let undergradFaded=  (renderResult.getByTestId(undergradCourseId).getAttribute('data-disabled')==='true')
      strictEqual(selectedDegreeProgram === 'BOTH', undergradFaded === false);
      
    })
    it('The grad course program is not faded when undergrad is selected ', ()=>{
      const { getByLabelText } = renderResult;
      const degreeProgramDropDown = getByLabelText(/Degree Program/i) as HTMLSelectElement;
      const selectedDegreeProgram = degreeProgramDropDown.value;
      fireEvent.change(degreeProgramDropDown, { target: { value: DEGREE_PROGRAM.GRADUATE } });
      let gradCourseId= testCourseScheduleData[0].courses[0].id
      console.log(gradCourseId)
      let gradFaded=  (renderResult.getByTestId(gradCourseId).getAttribute('data-disabled')==='true')
      strictEqual(gradCourseId === 'Graduate', gradFaded === false);
    })
    
  });
  describe('Requesting Semester Data', function () {
    let calendarYear: number;
    let term: TERM;
    beforeEach(function () {
      apiStub.resolves([]);
      clock = FakeTimers.install({
        toFake: ['Date'],
      });
    });
    afterEach(function () {
      clock.uninstall();
    });
    context('When current date is before July 1', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 5, 30);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch Spring data', function () {
        strictEqual(term, TERM.SPRING);
      });
      it('Should use the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear);
      });
    });
    context('When current date is after July 1', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 11, 1);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch Fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
    context('When current date is July 1', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 6, 1);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch Fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
    context('When current date is new year\'s day', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 0, 1);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch spring data', function () {
        strictEqual(term, TERM.SPRING);
      });
      it('Should use the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear);
      });
    });
    context('When current date is new year\'s eve', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 11, 31);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
  });
  context('While fetching data', function () {
    it('Should display the spinner', function () {
      apiStub.resolves([]);
      const { queryByText } = render(
        <SchedulePage />
      );
      const spinner = queryByText('Fetching Course Schedule');
      strictEqual(!!spinner, true);
    });
  });
  context('When the API call returns data', function () {
    context('when data is empty', function () {
      it('shows an error message saying there is no data', async function () {
        apiStub.resolves([]);
        const fakeDispatchMessage = stub();
        const { getByText } = render(
          <SchedulePage />,
          {
            dispatchMessage: fakeDispatchMessage,
          }
        );
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Course Schedule'
        ));

        const dispachArgs = fakeDispatchMessage.args[0][0];
        const errorMsg = dispachArgs.message.text as string;
        strictEqual(
          errorMsg.includes('There is no schedule data'),
          true
        );
      });
    });
    context('when data is not empty', function () {
      it('Should render the data into the schedule', async function () {
        apiStub.resolves(dummy.testCourseScheduleData);
        const { queryByText, queryAllByText } = render(
          <SchedulePage />
        );
        await waitForElementToBeRemoved(() => queryByText(
          'Fetching Course Schedule'
        ));
        strictEqual(apiStub.callCount, 1);
        const [testSessionBlock] = dummy.testCourseScheduleData;
        const [testCourseBlock] = testSessionBlock.courses;
        const sessionBlock = queryAllByText(testSessionBlock.coursePrefix);
        const courseListing = queryAllByText(testCourseBlock.courseNumber);
        strictEqual(!!sessionBlock, true);
        strictEqual(!!courseListing, true);
      });
    });
  });
  context('When the API call fails', function () {
    it('Should dispatch an error', async function () {
      apiStub.rejects(dummy.error);
      const { queryByText } = render(
        <SchedulePage />,
        { dispatchMessage }
      );
      await waitForElementToBeRemoved(() => queryByText(
        'Fetching Course Schedule'
      ));
      strictEqual(dispatchMessage.callCount, 1);
    });
  });
});
