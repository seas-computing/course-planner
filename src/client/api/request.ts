import axios from 'axios';

export * from 'axios';

/**
 * Exports a common instance of Axios with the baseURL set to point to our
 * server's hostname
 */

export default axios.create({
  /*
   * When loaded via webpack. this "process.env.SERVER_URL" will be replaced by
   * the string literal value of SERVER_URL in the build environment.
   * For testing, it will use the current value of process.env.SERVER_URL,
   * which is set to '' in .mochainit.ts at the project root.
   */
  baseURL: process.env.SERVER_URL,
  withCredentials: true,
});
