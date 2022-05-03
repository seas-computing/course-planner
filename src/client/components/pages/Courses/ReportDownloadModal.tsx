import React, {
  FunctionComponent,
  useContext,
  useState,
  useMemo,
  useEffect,
  ChangeEvent,
  useCallback,
  useRef,
} from 'react';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Dropdown,
  Button,
  VARIANT,
  ModalMessage,
  LoadSpinner,
  POSITION,
} from 'mark-one';
import { DropdownProps } from 'mark-one/lib/Forms/Dropdown';
import { MetadataContext } from 'client/context';
import { TERM } from 'common/constants';
import {
  getCourseReport,
  ReportRange,
  ReportRangeUpdate,
} from 'client/api';

/**
 * Props for controlling the opening and closing of the modal
 */
interface ReportDownloadModalProps {
  /** Whether the mopdal should be visible */
  isVisible: boolean;
  /** Handler to call to close the modal */
  closeModal: () => void;
}

/**
 * Allows the user to download a report covering a specific range of academic
 * years
 */
const ReportDownloadModal: FunctionComponent<ReportDownloadModalProps> = ({
  isVisible,
  closeModal,
}) => {
  /**
   * Get the range of our data from the metadatacontext
   */
  const {
    semesters,
    currentAcademicYear,
  } = useContext(MetadataContext);
  /**
   * Track the currently selected start and end years
   */
  const [
    currentReportRange,
    setCurrentReportRange,
  ] = useState<ReportRange>(null);

  /**
   * Track the download state so we can display a spinner
   */
  const [
    reportDownloading,
    setReportDownloading,
  ] = useState<boolean>(false);

  /**
   * Track any errors returned from the download process
   */
  const [
    downloadError,
    setDownloadError,
  ] = useState<string>();

  /**
   * Set a ref to focus the modal header
   */
  const modalHeaderRef = useRef<HTMLHeadingElement>(null);

  /**
   * Parse the list of semesters into a list of academic year dropdown options
   */
  const yearList = useMemo(() => semesters
    .reduce<DropdownProps['options']>(
    (years, current) => {
      if (current.startsWith(TERM.SPRING)) {
        const academicYear = current.replace(/\D/g, '');
        years.push({
          label: academicYear,
          value: academicYear,
        });
      }
      return years;
    }, []
  ), [semesters]);

  /**
   * Call back for updating the currrently selected start/end year. To avoid
   * invalid combinations, we'll shift the other choice when the user selects a
   * year outside the valid range.
   *
   * E.g., if the start year is 2021 and end year is 2024, then the user
   * changes the end year to 2019, we'll also change the start year to 2019.
   */
  const updateReportRange = useCallback((
    newRange: ReportRangeUpdate
  ) => {
    if ('startYear' in newRange) {
      const { startYear } = newRange;
      setCurrentReportRange(({ endYear }) => ({
        startYear,
        endYear: endYear >= startYear
          ? endYear
          : startYear,
      }));
    } else {
      const { endYear } = newRange;
      setCurrentReportRange(({ startYear }) => ({
        endYear,
        startYear: startYear <= endYear
          ? startYear
          : endYear,
      }));
    }
  }, [setCurrentReportRange]);

  /**
   * Fetch the report data from the server, then download it in the background
   * and close the modal. If the download fails, keep the modal open and
   * display an error.
   */
  const downloadCoursesReport = useCallback(async () => {
    setReportDownloading(true);
    setDownloadError('');
    try {
      await getCourseReport(currentReportRange);
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setDownloadError(err.message);
      } else {
        setDownloadError('Report download failed');
      }
    } finally {
      setReportDownloading(false);
    }
  }, [
    currentReportRange,
    setReportDownloading,
    closeModal,
  ]);

  /**
   * When the modal opens:
   * 1. set/reset start and end year to the currentAcademicYear and last available
   * year, respectively
   * 2. clear existing errors when the modal opens
   * 3. focus the header of the modal
   */
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        if (modalHeaderRef.current) {
          modalHeaderRef.current.focus();
        }
      });
      setDownloadError('');
      if (currentAcademicYear) {
        const endYear = [...yearList].pop().value;
        setCurrentReportRange({
          startYear: currentAcademicYear.toString(),
          endYear,
        });
      }
    }
  }, [
    modalHeaderRef,
    isVisible,
    yearList,
    currentAcademicYear,
  ]);

  return (
    <Modal
      isVisible={isVisible}
      ariaLabelledBy="report-download-header"
      closeHandler={closeModal}
    >
      <ModalHeader
        forwardRef={modalHeaderRef}
        tabIndex={0}
      >
        <span id="report-download-header">
          Download Course Report
        </span>
      </ModalHeader>
      <ModalBody>
        { reportDownloading
          ? (
            <LoadSpinner>
              Downloading Report
            </LoadSpinner>
          )
          : (
            <>
              <Dropdown
                options={yearList}
                onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                  updateReportRange({ startYear: evt.target.value });
                }}
                value={currentReportRange?.startYear.toString()}
                label="Start Year"
                labelPosition={POSITION.LEFT}
                name="report-download-start-year"
                id="report-download-start-year"
              />
              <Dropdown
                options={yearList}
                onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                  updateReportRange({ endYear: evt.target.value });
                }}
                value={currentReportRange?.endYear.toString()}
                label="End Year"
                labelPosition={POSITION.LEFT}
                name="report-download-end-year"
                id="report-download-end-year"
              />
            </>
          )}
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={reportDownloading}
          variant={VARIANT.PRIMARY}
          onClick={downloadCoursesReport}
        >
          Download
        </Button>
        {downloadError
          ? (
            <ModalMessage
              variant={VARIANT.NEGATIVE}
            >
              {downloadError}
            </ModalMessage>
          )
          : null}
        <Button
          variant={VARIANT.DEFAULT}
          onClick={closeModal}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReportDownloadModal;
