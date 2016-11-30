export interface StateProps {
  src: string;
  brightness?: number;
  contrast?: number;
  isInverted?: boolean;
  isFlippedX?: boolean;
  isFlippedY?: boolean;
  canvasHeight: number;
  canvasWidth: number;
  imageHeight: number;
  imageWidth: number;
  scale: number;
  scaleOriginX: number | null;
  scaleOriginY: number | null;
  landmarks: ReadonlyArray<{
    label: string;
    symbol: string;
    value: GeometricalObject;
  }>;
  getPropsForPoint: (symbol: string) => any;
  getPropsForVector: (symbol: string) => any;
  getPropsForAngle: (symbol: string) => any;
  highlightedLandmarks: { [symbol: string]: true };
  activeTool: (dispatch: DispatchFunction) => EditorTool;
};

export interface DispatchProps {
  dispatch: DispatchFunction;
};

export type AdditionalPropsToMerge = EditorTool;

export type ConnectableProps = StateProps & DispatchProps & AdditionalPropsToMerge;

export interface UnconnectableProps {
  className?: string;
};

export type Props = ConnectableProps & UnconnectableProps;

export default Props;
