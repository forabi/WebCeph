import * as React from 'react';

import Progress from 'material-ui/CircularProgress';

interface Props {
  className?: string;
  Component?: React.Factory<any>;
  WhileLoading?: React.Factory<any>;
  Error?: React.Factory<any>;
  isLoading: boolean;
  hasFailed: boolean;
}

import { pure } from 'recompose';

const defaultLoading = () => <Progress color="white" />;
const defaultError = () => <span>Error</span>;

const AsyncComponent = pure(({
  isLoading, WhileLoading = defaultLoading,
  hasFailed, Error = defaultError,
  Component,
}: Props) => {
  if (hasFailed) {
    return <Error />;
  } else if (isLoading) {
    return <WhileLoading />;
  }
  return typeof Component !== 'undefined' ? <Component /> : null;
});

export default AsyncComponent;
export { Props };
