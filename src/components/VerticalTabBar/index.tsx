import * as React from 'react';
import Props from './props';

import map from 'lodash/map';

import * as cx from 'classnames';

const classes = require('./style.scss');

class VerticalTabBar extends React.PureComponent<Props, { }> {
  render() {
    return (
      <div className={cx(classes.root, this.props.className)}>
        {
          map(this.props.children, (_, i) => (
            <button
              tabIndex={0}
              key={i}
              className={cx(classes.tab_item, { [classes.tab_item__active]: i === this.props.activeTabId })}
              onClick={() => this.props.onTabChanged(i)}
            >
              {i + 1}
            </button>
          ))
        }
        {
          <button
            className={cx(
              classes.tab_item,
              classes.tab_item_placeholder,
            )}
            onClick={this.props.onAddNewTab}
          >
            +
          </button>
        }
      </div>
    );
  }
}

export default VerticalTabBar;
