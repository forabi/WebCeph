import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import CephaloEditor from '../CephaloEditor';

import classes = require('./style.css');
try {
  injectTapEventPlugin();
} catch (e) { }

const App = (props: any) => (
  <MuiThemeProvider>
    <div className={classes.root}>
      <CephaloEditor className={classes.editor} />
    </div>
  </MuiThemeProvider>
);

export default App;
