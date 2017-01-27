import * as React from 'react';

import { connect } from 'react-redux';

import Image from './connected';
import AsyncComponent, { Props as AsyncProps } from 'components/AsyncComponent';

import { OwnProps } from './props';

import {
  isImageLoading,
  hasImageLoadFailed,
} from 'store/reducers/workspace/image';

import { pure } from 'recompose';

export const AsyncCephaloImage = pure((props: OwnProps & AsyncProps) => {
  const {
    isLoading,
    hasFailed,
    ...rest,
  } = props;
  const component = () => <Image {...rest} />;
  return (
    <AsyncComponent
      isLoading={isLoading}
      hasFailed={hasFailed}
      Component={component}
    />
  );
});

export default connect<Partial<AsyncProps>, { }, OwnProps>(
  (state, { imageId }: OwnProps) => ({
    hasFailed: hasImageLoadFailed(state)(imageId),
    isLoading: isImageLoading(state)(imageId),
  }),
)(AsyncCephaloImage);
