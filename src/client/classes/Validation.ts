import { AxiosError } from 'axios';
import { camelCaseToTitleCase } from 'common/utils/util';

/**
 * Represents the structure of the message of a Bad Request error
 */
export interface BadRequestMessageInfo {
  children: unknown[];
  constraints: Record<string, string>;
  property: string;
}

/**
 * Represents the structure of a Bad Request error
 */
export interface BadRequestInfo {
  statusCode: string;
  error: string;
  message: BadRequestMessageInfo[];
}

/**
 * Represents the structure of a server error
 */
export interface ServerErrorInfo {
  statusCode: string;
  error: string;
  message: Record<string, string>;
}

/**
 * Used for creating client friendly error messages
 */
export class ErrorParser {
  /**
   * Converts server error message(s) to be more readily user readable by
   * changing the properties to user friendly display names and combining,
   * if any, errors of the same form field.
   */
  static parseBadRequestError(serverError: AxiosError,
    displayNames: Record<string, string>): Record<string, string> {
    const { response } = serverError;
    const errors = {};
    if (response.data
      && (response.data as BadRequestInfo).message
      && Array.isArray(
        (response.data as BadRequestInfo).message
      )) {
      const data = response.data as BadRequestInfo;
      const messages = data.message;
      messages.forEach((problem) => {
        const { property } = problem;
        // Since the error message returned from the server includes
        // the property name in camel case, this converts the property
        // name to be more understandable by the user (e.g. 'termPattern'
        // becomes 'Term Pattern'). The rest of the error message follows.
        let displayName = displayNames[property];
        // If we don't know the display name,
        // convert the property to title case for user readability.
        if (!displayName) {
          displayName = camelCaseToTitleCase(property);
        }
        // We ignore the object keys
        // since they don't contain additional info
        errors[property] = Object.values(problem.constraints)
        // Replace the beginning with the display name
        // if the first word of the error is the property name
          .map((constraint) => constraint.replace(
            new RegExp('^' + property + '\\b'),
            displayName
          ))
        // If we get multiple errors per property, separate them
          .join('; ');
      });
    }
    return errors;
  }
}
