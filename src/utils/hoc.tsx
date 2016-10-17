import { withState } from 'recompose';

interface ZoomableProps {
  /**
   * Zoom value as a percentage
   */
  zoom: number;
  originX: number;
  originY: number;
}

export const Zoomable = (ZoomableProps) => (Component) => (
  <div
);