import { MessageProps } from './Message/index';

export interface StateProps {
  messages: Array<{
    id: string;
  } & MessageProps>;
};

export interface DispatchProps {

};

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
