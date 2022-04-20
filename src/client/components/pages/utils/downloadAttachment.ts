/**
 * Provide asynchronous downloading of a fetch response, based on
 * https://itnext.io/how-to-download-files-with-javascript-d5a69b749896
 */
export default async (
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
  document.body.appendChild(downloader);
  downloader.click();

  // Clean up temporary elements
  document.body.removeChild(downloader);
  URL.revokeObjectURL(fileURL);
};
