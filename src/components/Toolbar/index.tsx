import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Slider from 'material-ui/Slider';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconUndo from 'material-ui/svg-icons/content/undo';
import IconRedo from 'material-ui/svg-icons/content/redo';
import IconEraser from 'material-ui/svg-icons/content/remove-circle-outline';
import IconAddPoint from 'material-ui/svg-icons/image/control-point';
import IconZoom from 'material-ui/svg-icons/action/zoom-in';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';

import { ToolsIds } from 'editorTools';

import ToolbarProps from './props';

const CephaloEditorToolbar = (props: ToolbarProps) => {
  const {
    canEdit, canRedo, canUndo,
    contrast, brightness, isImageInverted,
    activeToolId,
    onBrightnessChange,
    onContrastChange,
    onFlipXClick,
    onUndoClick,
    onRedoClick,
    // onFlipYClick,
    onInvertToggle,
    setActiveTool,
  } = props;

  const cannotEdit = !canEdit;
  return (
    <div className={props.className}>
      <div>
        <FlatButton onClick={onUndoClick} disabled={cannotEdit || !canUndo} label="Undo" icon={<IconUndo/>} />
        <FlatButton onClick={onRedoClick} disabled={cannotEdit || !canRedo} label="Redo" icon={<IconRedo/>} />
        <FlatButton onClick={onFlipXClick} disabled={cannotEdit} label="Flip" icon={<IconFlip/>} />
        <FlatButton
          disabled={cannotEdit || activeToolId === ToolsIds.ERASER}
          label="" icon={<IconEraser />}
          onClick={() => setActiveTool(ToolsIds.ERASER)}
        />
        <FlatButton
          disabled={cannotEdit || activeToolId === ToolsIds.ADD_POINT}
          label="" icon={<IconAddPoint />}
          onClick={() => setActiveTool(ToolsIds.ADD_POINT)}
        />
        <FlatButton
          disabled={true || cannotEdit || activeToolId === ToolsIds.ZOOM_WITH_CLICK}
          label="" icon={<IconZoom />}
          onClick={() => setActiveTool(ToolsIds.ZOOM_WITH_CLICK)}
        />
      </div>
    </div>
  );
};

const Corrections = () => (
  <div>
    Brightness
    <Slider
      style={{ width: 200, margin: 15 }}
      min={0} max={100}
      defaultValue={brightness}
      onChange={(_, v) => onBrightnessChange(v)}
    />
    Contrast
    <Slider
      style={{ width: 200, margin: 15 }}
      min={-100} max={100}
      defaultValue={contrast}
      onChange={(_, v) => onContrastChange(v)}
    />
    <Divider />
    <Checkbox label="Invert" checked={isImageInverted} onCheck={onInvertToggle} />
  </div>
);

export default CephaloEditorToolbar;
