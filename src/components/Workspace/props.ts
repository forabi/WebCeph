export interface StateProps {
  src: string;
  brightness?: number;
  contrast?: number;
  isInverted?: boolean;
  isFlippedX?: boolean;
  isFlippedY?: boolean;
  canvasSize: {
    height: number;
    width: number;
  };
  imageHeight: number;
  imageWidth: number;
  scale: number;
  landmarks: ReadonlyArray<{
    label: string;
    symbol: string;
    value: GeoObject;
  }>;
  getPropsForLandmark: (symbol: string) => { [prop: string]: any };
  isHighlightMode: boolean;
  highlightedLandmarks: {
    [symbol: string]: boolean;
  };
  activeTool: EditorTool;
};

export interface DispatchProps {
  dispatch: GenericDispatch;
};

export type ConnectableProps = StateProps & DispatchProps;

export interface UnconnectableProps {
  className?: string;
};

export type Props = ConnectableProps & UnconnectableProps;

export default Props;
