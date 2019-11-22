import React, {
  FunctionComponent, ReactElement,
} from 'react';

/**
 * The component represents the 404 page. When a user visits a URL path that is
 * not defined, they will see this NoMatch component render on the page.
 */

const NoMatch: FunctionComponent = (): ReactElement => (
  <div>
    404 Error: The page you requested cannot be found.
  </div>
);

export default NoMatch;
