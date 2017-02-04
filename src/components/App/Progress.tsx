import * as React from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const scaleInAndRotate = require('transitions/scale-in-and-rotate.scss');

const Progress = () => (
  <ReactCSSTransitionGroup
    className={scaleInAndRotate.root}
    transitionAppear
    transitionLeave
    transitionName={scaleInAndRotate}
    transitionAppearTimeout={1000}
    transitionEnterTimeout={1000}
    transitionLeaveTimeout={1000}
  >
    <CircularProgress thickness={2} color="#0078d7" size={60} />
  </ReactCSSTransitionGroup>
);

export default Progress;
