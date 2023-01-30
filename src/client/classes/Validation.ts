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

