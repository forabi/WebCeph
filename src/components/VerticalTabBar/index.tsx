import * as React from 'react';
import Props from './props';

import map from 'lodash/map';

import * as cx from 'classnames';

const classes = require('./style.scss');

class VerticalTabBar extends React.PureComponent<Props, { }> {
  handleTabClick = (id: string) => (_: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onTabChanged(id);
  }

  handleNewTab = (_: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onAddNewTab();
  }

  render() {
    return (
      <div className={cx(classes.root, this.props.className)}>
        {map(this.props.tabs, (id, i) => (
          <button
            tabIndex={0}
            key={id}
            className={cx(classes.tab_item, { [classes.tab_item__active]: id === this.props.activeTabId })}
            onClick={this.handleTabClick(id)}
          >
            {i + 1}
          </button>
        ))}
        {
          <button
            className={classes.tab_item_placeholder}
            onClick={this.handleNewTab}
          >
            +
          </button>
        }
      </div>
    );
  }
}

export default VerticalTabBar;
