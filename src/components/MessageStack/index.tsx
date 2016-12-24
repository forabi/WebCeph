import * as React from 'react';
import * as cx from 'classnames';

import map from 'lodash/map';
import memozie from 'lodash/memoize';

const classes = require('./style.scss');

import Props from './props';

import Message from './Message';

interface State {
  dismissed: Record<string, true>;
}

class MessageStack extends React.PureComponent<Props, State> {
  private dismissMessage = memozie((key: string): any => () => {
    this.setState(({ dismissed }) => ({
      dismissed: {
        ...dismissed,
        [key]: true,
      },
    }));
  });

  render() {
    const {
      className,
      messages: messages,
    } = this.props;
    return (
      <div className={cx(classes.root, className)}>
        {map(messages, (message) => {
          if (this.state.dismissed[message.id]) {
            return null;
          }
          return (
            <Message
              key={message.id}
              {...message}
              onDismiss={this.dismissMessage(message.id)}
            />
          );
        })}
      </div>
    );
  }
};

export default MessageStack;
