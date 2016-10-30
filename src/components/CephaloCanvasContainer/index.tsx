import * as React from 'react';
import ResizeObservable from 'utils/resize-observable';
import CephaloCanvas from 'components/CephaloCanvas/connected';
import CephaloDropzone from 'components/CephaloDropzone/connected';
import * as cx from 'classnames';
import Props from './props';
import { pure } from 'recompose';

const classes = require('./style.scss');

const CephaloCanvasContainer = pure(({ className, hasImage, onResize }: Props) => {
  return (
    <ResizeObservable
      className={cx(className, classes.root)}
      onResize={({ contentRect: { width, height } }) => onResize(width, height)}
    >
      {hasImage ? <CephaloCanvas /> : <CephaloDropzone />}
    </ResizeObservable>
  );
});

export default CephaloCanvasContainer;