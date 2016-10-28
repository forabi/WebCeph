import * as React from 'react';
import CephaloCanvasContainer from 'components/CephaloCanvasContainer/connected';
import CompatibilityChecker from 'components/CompatibilityChecker/connected';
import AnalysisResultsViewer from 'components/AnalysisResultsViewer/connected';
import AnalysisStepper from 'components/AnalysisStepper/connected';
import Menu from 'components/Menu/connected';
import CommandPalette from 'components/CommandPalette/connected';
import Toolbar from 'components/Toolbar/connected';

const classes = require('./style.scss');

type NewAppProps = { };

const NewApp = (_: NewAppProps) => (
  <div className={classes.root}>
    <CommandPalette className={classes.command_palette} />
    <AnalysisResultsViewer />
    <CompatibilityChecker />
    <div className={classes.container}>
      <Menu className={classes.menu} />
      <div className={classes.row}>
        <CephaloCanvasContainer className={classes.main} />
        <AnalysisStepper className={classes.stepper} />
      </div>
      <Toolbar className={classes.toolbar} />
    </div>
  </div>
);

export default NewApp;
