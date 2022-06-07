/**
 * HTTP response status codes used to indicate the success (or otherwise) of an
 * HTTP request
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export enum HTTP_STATUS {
  // 2XX Success Messages
  /**
  * The HTTP 200 OK success status response code indicates that the request
  * has succeeded. A 200 response is cacheable by default
  * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
  */
  OK = 200,

  // 4XX Client Errors
  /**
  * The server cannot or will not process the request due to something that is
  * perceived to be a client error (e.g., malformed request syntax, invalid
  * request message framing, or deceptive request routing).
  * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
  */
  BAD_REQUEST = 400,

  // 5XX Server Errors
  /**
  * This error response is a generic "catch-all" response. Usually, this
  * indicates the server cannot find a better 5xx error code to response.
  * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
  */
  INTERNAL_SERVER_ERROR = 500,
}
