import React, { useState } from 'react';
import {
  render, fireEvent, within, RenderResult,
} from 'test-utils';
import { strictEqual } from 'assert';
import { TERM } from 'common/constants';
import * as dummy from 'testData';
import { MetadataContextValue } from 'client/context';
import { stub, SinonStub } from 'sinon';
import ReportDownloadModal from '../ReportDownloadModal';

describe('Report Download Modal', function () {
  const currentAcademicYear = 2020;
  const semesters = [
    `${TERM.FALL} 2017`,
    `${TERM.SPRING} 2018`,
    `${TERM.FALL} 2018`,
    `${TERM.SPRING} 2019`,
    `${TERM.FALL} 2019`,
    `${TERM.SPRING} 2020`,
    `${TERM.FALL} 2020`,
    `${TERM.SPRING} 2021`,
    `${TERM.FALL} 2021`,
    `${TERM.SPRING} 2022`,
    `${TERM.FALL} 2022`,
    `${TERM.SPRING} 2023`,
    `${TERM.FALL} 2023`,
    `${TERM.SPRING} 2024`,
  ];
  const testMetadata = new MetadataContextValue({
    ...dummy.metadata,
    currentAcademicYear,
    semesters,
  }, () => {});
  let getReportStub: SinonStub;
  beforeEach(function () {
    getReportStub = stub();
  });
  const TestPage = () => {
    const [showModal, setShowModal] = useState<boolean>(false);
    return (
      <div>
        <ReportDownloadModal
          isVisible={showModal}
          closeModal={() => setShowModal(false)}
          headerText="Download Course Report"
          getReport={getReportStub}
        />
        <button
          type="button"
          onClick={() => { setShowModal(true); }}
        >
          Open Modal
        </button>
      </div>
    );
  };
  describe('Default years', function () {
    it('Should run from currentAcademicYear to the last available year', async function () {
      const page = render(
        <TestPage />,
        {
          metadataContext: testMetadata,
        }
      );
      fireEvent.click(page.getByText('Open Modal'));
      const modal = await page.findByRole('dialog');
      const startYear = within(modal).getByLabelText('Start Year') as HTMLSelectElement;
      strictEqual(startYear.value, currentAcademicYear.toString());
      const endYear = within(modal).getByLabelText('End Year') as HTMLSelectElement;
      strictEqual(endYear.value, [...semesters].pop().replace(/\D/g, ''));
    });
  });
  describe('Changing years', function () {
    let page: RenderResult;
    let modal: HTMLElement;
    let startYear: HTMLSelectElement;
    let endYear: HTMLSelectElement;
    beforeEach(async function () {
      page = render(
        <TestPage />,
        {
          metadataContext: testMetadata,
        }
      );
      fireEvent.click(page.getByText('Open Modal'));
      modal = await page.findByRole('dialog');
    });
    context('Setting the startYear to a date after the endYear', function () {
      beforeEach(function () {
        endYear = within(modal).getByLabelText('End Year') as HTMLSelectElement;
        fireEvent.change(endYear, {
          target: {
            value: (currentAcademicYear + 1).toString(),
          },
        });
        startYear = within(modal).getByLabelText('Start Year') as HTMLSelectElement;
        fireEvent.change(startYear, {
          target: {
            value: (currentAcademicYear + 2).toString(),
          },
        });
      });
      it('Should move the endYear to match the startYear', function () {
        strictEqual(startYear.value, (currentAcademicYear + 2).toString());
        strictEqual(endYear.value, startYear.value);
      });
    });
    context('Setting the startYear to a date before the endYear', function () {
      beforeEach(function () {
        endYear = within(modal).getByLabelText('End Year') as HTMLSelectElement;
        fireEvent.change(endYear, {
          target: {
            value: (currentAcademicYear + 2).toString(),
          },
        });
        startYear = within(modal).getByLabelText('Start Year') as HTMLSelectElement;
        fireEvent.change(startYear, {
          target: {
            value: (currentAcademicYear + 1).toString(),
          },
        });
      });
      it('Should not change the endYear', function () {
        strictEqual(startYear.value, (currentAcademicYear + 1).toString());
        strictEqual(endYear.value, (currentAcademicYear + 2).toString());
      });
    });
    context('Setting the endYear to a date before the startYear', function () {
      beforeEach(function () {
        startYear = within(modal).getByLabelText('Start Year') as HTMLSelectElement;
        fireEvent.change(startYear, {
          target: {
            value: (currentAcademicYear - 1).toString(),
          },
        });
        endYear = within(modal).getByLabelText('End Year') as HTMLSelectElement;
        fireEvent.change(endYear, {
          target: {
            value: (currentAcademicYear - 2).toString(),
          },
        });
      });
      it('Should move the startYear to match the endYear', function () {
        strictEqual(endYear.value, (currentAcademicYear - 2).toString());
        strictEqual(startYear.value, endYear.value);
      });
    });
    context('Setting the endYear to a date after the startYear', function () {
      beforeEach(function () {
        startYear = within(modal).getByLabelText('Start Year') as HTMLSelectElement;
        fireEvent.change(startYear, {
          target: {
            value: (currentAcademicYear - 1).toString(),
          },
        });
        endYear = within(modal).getByLabelText('End Year') as HTMLSelectElement;
        fireEvent.change(endYear, {
          target: {
            value: (currentAcademicYear + 1).toString(),
          },
        });
      });
      it('Should not change the start Year', function () {
        strictEqual(startYear.value, (currentAcademicYear - 1).toString());
        strictEqual(endYear.value, (currentAcademicYear + 1).toString());
      });
    });
  });
});
