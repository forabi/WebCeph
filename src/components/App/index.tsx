import * as React from 'react';

import VerticalTabBar from 'components/VerticalTabBar';

import Progress from './Progress';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import * as cx from 'classnames';

import injectTapEventPlugin from 'react-tap-event-plugin';

import attempt from 'lodash/attempt';

import { compose, lifecycle, pure } from 'recompose';

import Props from './props';

attempt(injectTapEventPlugin);

type State = { };

const classes = require('./style.scss');

const addLifeCycleHooks = lifecycle({
  componentDidMount(this: React.Component<Props, { }>) {
    this.props.onComponentMount();
  },
});

const enhance = compose<Props, State>(pure, addLifeCycleHooks);

const App = enhance(({ userAgent, isReady }: Props) => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    { isReady ? (
        <div className={classes.root}>
          <div className={classes.container}>
            <div className={classes.row}>
              <VerticalTabBar
                className={classes.tab_bar}
                activeTabId={1}
                onTabChanged={(i) => alert(`Tab changed to ${i}`)}
                onAddNewTab={() => alert('Add new tab')}
              >
                <div />
                <div />
              </VerticalTabBar>
              <div className={classes.workspace} />
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.root_loading}>
          <Progress />
        </div>
      )
    }
  </MuiThemeProvider>
));

export default App as React.ComponentClass<Props>;
