import React, { useState } from 'react';
import {
  render, fireEvent, within, RenderResult, waitForElementToBeRemoved,
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
  describe('Downloading the Report', function () {
    // Need to provide stubs for the Browser fetch and ObjectURL methods, as
    // these don't exist in current version of node, then remove them
    // afterwards to prevent leaks in other tests
    let fetchStub: SinonStub;
    beforeEach(function () {
      fetchStub = stub();
      global.fetch = fetchStub;
      URL.createObjectURL = stub().returns(dummy.string);
      URL.revokeObjectURL = stub();
    });
    afterEach(function () {
      delete global.fetch;
      delete URL.createObjectURL;
      delete URL.revokeObjectURL;
    });
    context('When fetch is unsuccessful', function () {
      beforeEach(function () {
        fetchStub.rejects(dummy.error);
      });
      it('Should display an error message', async function () {
        const page = render(
          <TestPage />,
          {
            metadataContext: testMetadata,
          }
        );
        fireEvent.click(page.getByText('Open Modal'));
        const modal = await page.findByRole('dialog');
        const downloadButton = within(modal).getByText('Download');
        fireEvent.click(downloadButton);
        await waitForElementToBeRemoved(
          () => within(modal).getByText('Downloading Report')
        );
        return within(modal).findByText(dummy.error.message);
      });
    });
    context('When fetch is successful', function () {
      context('But there is an error on the server', function () {
        beforeEach(function () {
          fetchStub.resolves({
            ok: false,
            text: () => Promise.resolve('Server Error'),
          });
        });
        it('Should display an error message', async function () {
          const page = render(
            <TestPage />,
            {
              metadataContext: testMetadata,
            }
          );
          fireEvent.click(page.getByText('Open Modal'));
          const modal = await page.findByRole('dialog');
          const downloadButton = within(modal).getByText('Download');
          fireEvent.click(downloadButton);
          await waitForElementToBeRemoved(
            () => within(modal).getByText('Downloading Report')
          );
          return within(modal).findByText(/Server Error/);
        });
      });
      context('With data from the server', function () {
        const success = 'Success';
        const successBlob = new Blob([success]);
        beforeEach(function () {
          fetchStub.resolves({
            ok: true,
            blob: () => Promise.resolve(successBlob),
            headers: new Map([['Content-Disposition', `attachment; filename="${success}"`]]),
          });
        });
        it('Should download the appropriate years and close the modal', async function () {
          const page = render(
            <TestPage />,
            {
              metadataContext: testMetadata,
            }
          );
          fireEvent.click(page.getByText('Open Modal'));
          const modal = await page.findByRole('dialog');
          const downloadButton = within(modal).getByText('Download');
          fireEvent.click(downloadButton);
          const downloader = await page.findByTitle(`Download ${success}`) as HTMLAnchorElement;
          strictEqual(downloader.href, dummy.string);
          strictEqual(downloader.download, success);
          // Make sure the link and modal are gone afterwards
          strictEqual(page.queryByTitle(downloader.title), null);
          strictEqual(page.queryByRole('dialog'), null);
        });
      });
    });
  });
});
