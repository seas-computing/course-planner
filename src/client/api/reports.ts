/**
 * Represents the start and end years that will be covered by the downloaded
 * report
 */
export interface ReportRange {
  startYear: string;
  endYear: string;
}

/**
* Typed so that only one of startYear/endYear can be provided
*/
export type ReportRangeUpdate = Pick<ReportRange, 'startYear'> | Pick<ReportRange, 'endYear'>;

/**
 * Provide asynchronous downloading of a fetch response, based on
 * https://itnext.io/how-to-download-files-with-javascript-d5a69b749896
 */
const downloadAttachment = async (
  response: Response
): Promise<void> => {
  // Check to make sure this is downloadable
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Download failed. ${error}`);
  }

  // Pull raw data from the reponse and write it to a data url
  const fileData = await response.blob();
  const fileURL = URL.createObjectURL(fileData);

  // parse the filename from the header
  const disposition = response.headers.get('Content-Disposition');
  const [,filename] = /filename="(.+)"$/.exec(disposition);

  // Create a temporary link element pointing to our data url and click it
  const downloader = document.createElement('a');
  downloader.href = fileURL;
  downloader.download = filename;
  downloader.title = `Download ${filename}`;
  document.body.appendChild(downloader);
  // Adds an imperceptable delay to make this testable
  setTimeout(() => {
    downloader.click();
    // Clean up temporary elements
    document.body.removeChild(downloader);
    URL.revokeObjectURL(fileURL);
  });
};

/**
 * Downloads the report data based on the range of years and report type
 * provided.
 */
export const getReport = async (
  range: ReportRange,
  reportType: string
): Promise<void> => {
  const server = new URL(process.env.SERVER_URL);
  if (!server.pathname.endsWith('/')) {
    server.pathname += '/';
  }
  server.pathname += `report/${reportType}`;
  if (range) {
    server.search = new URLSearchParams(
      Object.entries(range)
    ).toString();
  }
  const reportURL = server.toString();
  const response = await fetch(
    reportURL,
    { credentials: 'include' }
  );
  return downloadAttachment(response);
};

/**
 * Calls the getReport function for faculty for a specified range
 */
export const getFacultyReport = ((range: ReportRange): Promise<void> => getReport(range, 'faculty'));

/**
 * Calls the getReport function for courses for a specified range
 */
export const getCourseReport = ((range: ReportRange): Promise<void> => getReport(range, 'courses'));
