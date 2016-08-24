import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import CephaloEditor from '../CephaloEditor';
import cx from 'classnames';

const classes = require('./style.scss');

require('../../layout/_index.scss');

try {
  injectTapEventPlugin();
} catch (e) { }

const App = (props: any) => (
  <MuiThemeProvider>
    <div className={cx('col-xs-12', classes.root)}>
      <CephaloEditor className={cx('row', classes.editor)} />
    </div>
  </MuiThemeProvider>
);

export default App;
