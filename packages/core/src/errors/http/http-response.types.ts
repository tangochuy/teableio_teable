/* eslint-disable @typescript-eslint/naming-convention */

export type IHttpError = {
  /** a human-readable explanation specific to this occurrence of the problem. */
  message: string;
  /** the HTTP status code applicable to this problem, expressed as a string value. */
  status: number;
  /** an application-specific error code, expressed as a string value. */
  code: string;
};

export enum HttpErrorCode {
  // 400 - The request body does not match the schema for the expected parameters
  VALIDATION_ERROR = 'validation_error',
  // 401 - The bearer token is not valid.
  UNAUTHORIZED = 'unauthorized',
  // 401 - Given the bearer token used, the client doesn't have permission to perform this operation.
  UNAUTHORIZED_SHARE = 'unauthorized_share',
  // 402 - Payment Required
  PAYMENT_REQUIRED = 'payment_required',
  // 403 - Given the bearer token used, the client doesn't have permission to perform this operation.
  RESTRICTED_RESOURCE = 'restricted_resource',
  // 404 - Given the bearer token used, the resource does not exist. This error can also indicate that the resource has not been shared with owner of the bearer token.
  NOT_FOUND = 'not_found',
  // 460 - The user has reached the limit of the number of users that can be created in the current instance.
  USER_LIMIT_EXCEEDED = 'user_limit_exceeded',
  // 500 - An unexpected error occurred.
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  // 503 - database is unavailable or is not in a state that can be queried. Please try again later.
  DATABASE_CONNECTION_UNAVAILABLE = 'database_connection_unavailable',
  // 504 - The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server it needed to access in order to complete the request.
  GATEWAY_TIMEOUT = 'gateway_timeout',
  // Unknown error code
  UNKNOWN_ERROR_CODE = 'unknown_error_code',
}
