import * as React from 'react';
import each from 'lodash/each';
import assign from 'lodash/assign';

interface Props {
  className?: string;
  onResize(e: ResizeObserverEntry): any;
}

interface State {
  observer?: ResizeObserver;
}

export default class ResizeObservableComponent extends React.PureComponent<Props, State> {
  refs: {
    target: Element,
  };

  private handleResize: ResizeObserverCallback = (entries, _) => {
    each(entries, this.props.onResize);
  };
  
  componentDidMount() {
    const observer = new ResizeObserver(this.handleResize);
    observer.observe(this.refs.target);
    this.setState(state => assign({ }, state, { observer }));
  }

  componentWillUnmount() {
    if (this.state.observer !== undefined) {
      this.state.observer.disconnect();
    }
  }

  render() {
    return (
      <div className={this.props.className} ref="target">
        {this.props.children}
      </div>
    );
  }
};