import * as React from 'react';

import AnalysisResultsViewer from 'components/AnalysisResultsViewer/connected';
import AnalysisSelector from 'components/AnalysisSelector/connected';
import AnalysisStepper from 'components/AnalysisStepper/connected';
import CephaloCanvasContainer from 'components/CephaloCanvasContainer/connected';
import CommandPalette from 'components/CommandPalette/connected';
import CompatibilityChecker from 'components/CompatibilityChecker/connected';
import Menu from 'components/Menu/connected';
import Toolbar from 'components/Toolbar/connected';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import injectTapEventPlugin from 'react-tap-event-plugin';

import attempt from 'lodash/attempt';

attempt(injectTapEventPlugin);

const classes = require('./style.scss');

type Props = { };

const App = (_: Props) => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <div className={classes.root}>
      <CommandPalette className={classes.command_palette} />
      <AnalysisResultsViewer />
      <CompatibilityChecker />
      <div className={classes.container}>
        <Menu className={classes.menu} />
        <div className={classes.row}>
          <CephaloCanvasContainer className={classes.main} />
          <div className={classes.sidebar}>
            <AnalysisSelector className={classes.selector} />
            <AnalysisStepper className={classes.stepper} />
          </div>
        </div>
        <Toolbar className={classes.toolbar} />
      </div>
    </div>
  </MuiThemeProvider>
);

export default App;
