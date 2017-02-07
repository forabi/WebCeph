import * as React from 'react';
import each from 'lodash/each';

interface Props {
  className?: string;
  onResize(e: ResizeObserverEntry): any;
}

interface State {
  observer?: ResizeObserver;
}

export default class ResizeObservableComponent extends React.PureComponent<Props, State> {
  target: Element | null;

  componentDidMount() {
    if (this.target !== null) {
      const observer = new ResizeObserver(this.handleResize);
      observer.observe(this.target);
      this.setState(state => ({ ...state, observer }));
    }
  }

  componentWillUnmount() {
    if (this.state.observer !== undefined) {
      this.state.observer.disconnect();
    }
  }

  render() {
    return (
      <div className={this.props.className} ref={this.setTarget}>
        {this.props.children}
      </div>
    );
  }

  private setTarget = (node: Element | null) => this.target = node;
  private handleResize: ResizeObserverCallback = (entries, _) => {
    each(entries, this.props.onResize);
  }
};
