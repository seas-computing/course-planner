import React, {
  FunctionComponent,
} from 'react';

/**
 * The component represents the 403 page. When a user visits a URL path for a
 * page that they do not have access to, they will receive this error.
 */

const ForbiddenPage: FunctionComponent = () => (
  <div>
    403 Error: You are not authorized to view this page.
  </div>
);

export default ForbiddenPage;
