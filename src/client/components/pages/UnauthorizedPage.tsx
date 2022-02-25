import React, {
  FunctionComponent,
} from 'react';

/**
 * The component represents the 401 page. When a user attempts to visit
 * protected content without being logged-in, they'll see this page.
 */

const UnauthorizedPage: FunctionComponent = () => (
  <div>
    401 Error: You need to log in to view this page
  </div>
);

export default UnauthorizedPage;
