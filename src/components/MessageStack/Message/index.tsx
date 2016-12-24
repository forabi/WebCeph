import * as React from 'react';
import * as cx from 'classnames';

import FlatButton from 'material-ui/FlatButton';
import IconClose from 'material-ui/svg-icons/navigation/close';

import map from 'lodash/map';

const classes = require('./style.scss');

type ButtonProps = {
  onClick: () => any;
} & (
  {
    icon: React.ReactChild;
    label?: string;
  } | {
    icon?: React.ReactChild;
    label: string;
  }
);

const defaultButtons: ButtonProps[] = [];

export const DismissButton = (onDismiss: () => any): ButtonProps => ({
  icon: <IconClose />,
  onClick: onDismiss,
});

export interface MessageProps {
  text: string;
  className?: string;
  leftIcon?: React.ReactChild;
  buttons?: ButtonProps[];
  onDismiss?: () => any;
  dismissAfter?: number;
}

class Message extends React.PureComponent<MessageProps, { }> {
  componentDidMount = this.setTimer;
  componentDidUpdate = this.setTimer;
  componentWillUnmount = this.clearTimer;

  private timeout?: number;

  render() {
    const { className, onDismiss, leftIcon, text, buttons = defaultButtons } = this.props;
    let allButtons = buttons;
    if (typeof onDismiss === 'function') {
      allButtons = [
        ...buttons,
        DismissButton(onDismiss),
      ];
    }
    return (
      <div className={cx(classes.root, className)}>
        {leftIcon}
        <span className={classes.text}>{text}</span>
        <span className={classes.button_container}>
        {map(allButtons, ({ onClick, label='', icon }, i) => (
          <FlatButton key={label || i} label={label} icon={icon} onTouchTap={onClick} />
        ))}
        </span>
      </div>
    );
  }

  /** Set or update auto dismiss timer */
  private setTimer = () => {
    const { onDismiss, dismissAfter } = this.props;
    if (
      typeof dismissAfter === 'number' &&
      typeof onDismiss === 'function'
    ) {
      this.clearTimer();
      this.timeout = setTimeout(() => {
        onDismiss();
      }, this.props.dismissAfter);
    }
  }

  /** Clear auto dismiss timer if necessary */
  private clearTimer = () => {
    if (typeof this.timeout !== 'undefined') {
      clearTimeout(this.timeout);
    }
  }
};

export default Message;
