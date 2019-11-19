import React, {
  FunctionComponent, ReactElement,
} from 'react';

const NoMatch: FunctionComponent = (): ReactElement => (
  <div>
    404 Error: The page you requested cannot be found.
  </div>
);

export default NoMatch;
