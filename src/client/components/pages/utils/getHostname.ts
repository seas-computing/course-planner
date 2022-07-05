// Sinon does not allow stubbing of the window.location, so it is necessary to
// access this value from here so that we can stub the window location in a test
export const getHostname = (): string => window.location.hostname;

export const WindowUtils = {
  getHostname,
};
