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
  cursor: string | undefined;
  scale: number;
  scaleOriginX: number;
  scaleOriginY: number;
  landmarks: { [symbol: string]: GeometricalObject } | { };
  isHighlightModeActive: boolean;
  highlightedLandmarks: { [symbol: string]: boolean };
  activeTool: (dispatch: DispatchFunction) => EditorTool;
};

export interface DispatchProps {
  dispatch: DispatchFunction;
};

export type MergeProps = EditorTool;

export type ConnectableProps = StateProps & DispatchProps & MergeProps;

export interface UnconnectableProps {
  className?: string;
};

export type Props = ConnectableProps & UnconnectableProps;

export default Props;
