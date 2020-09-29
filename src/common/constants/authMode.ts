/**
 * List of valid authentication modes to be passed into Passport */

enum AUTH_MODE {
  /** Harvard Key */
  HKEY = 'harvardkey',
  /** Dummy authentication for local dev */
  DEV = 'development',
  /** An easily stubabble strategy for testing */
  TEST = 'testing',
}

export default AUTH_MODE;
