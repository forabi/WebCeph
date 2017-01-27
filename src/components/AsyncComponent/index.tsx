import * as React from 'react';

interface Props {
  className?: string;
  Component: React.Factory<any>;
  isLoading: boolean;
  hasFailed: boolean;
}

import Progress from 'material-ui/CircularProgress';

import { pure } from 'recompose';

const AsyncComponent = pure(({ hasFailed, Component, isLoading }: Props) => {
  if (hasFailed) {
    return <span>Error</span>;
  } else if (isLoading) {
    return <Progress color="white" />;
  }
  return <Component />;
});

export default AsyncComponent;
export { Props };
