import * as React from 'react';

import Props from './props';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import * as cx from 'classnames';

const classes = require('./style.scss');

const MainMenu = (props: Props) => (
  <div className={cx(classes.root, props.className)}>
    File
  </div>
);

export default MainMenu;
