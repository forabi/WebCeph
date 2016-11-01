import * as React from 'react';

import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import Slider from 'material-ui/Slider';

import IconAddPoint from 'material-ui/svg-icons/image/control-point';
import IconEraser from 'material-ui/svg-icons/content/remove-circle-outline';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconList from 'material-ui/svg-icons/action/list';
import IconRedo from 'material-ui/svg-icons/content/redo';
import IconUndo from 'material-ui/svg-icons/content/undo';
import IconZoom from 'material-ui/svg-icons/action/zoom-in';

import * as cx from 'classnames';

const classes = require('./style.scss');

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
    onToolButtonClick,
    onShowSummaryClick,
    canShowSummary,
  } = props;

  const cannotEdit = !canEdit;
  return (
    <div className={cx(classes.root, props.className)}>
      <FlatButton onClick={onUndoClick} disabled={cannotEdit || !canUndo} label="Undo" icon={<IconUndo/>} />
      <FlatButton onClick={onRedoClick} disabled={cannotEdit || !canRedo} label="Redo" icon={<IconRedo/>} />
      <FlatButton onClick={onFlipXClick} disabled={cannotEdit} label="Flip" icon={<IconFlip/>} />
      <FlatButton
        disabled={cannotEdit || activeToolId === ToolsIds.ERASER}
        label=""
        icon={<IconEraser />}
        onClick={onToolButtonClick.bind(null, ToolsIds.ERASER)}
      />
      <FlatButton
        disabled={cannotEdit || activeToolId === ToolsIds.SELECT}
        label=""
        icon={<IconAddPoint />}
        onClick={onToolButtonClick.bind(null, ToolsIds.SELECT)}
      />
      <FlatButton
        disabled={true || cannotEdit || activeToolId === ToolsIds.ZOOM_WITH_CLICK}
        label=""
        icon={<IconZoom />}
        onClick={onToolButtonClick.bind(null, ToolsIds.ZOOM_WITH_CLICK)}
      />
      <FlatButton
        disabled={!canShowSummary}
        label="Summary"
        icon={<IconList />}
        onClick={onShowSummaryClick}
      />
    </div>
  );
};

// const Corrections = () => (
//   <div>
//     Brightness
//     <Slider
//       style={{ width: 200, margin: 15 }}
//       min={0} max={100}
//       defaultValue={brightness}
//       onChange={(_, v) => onBrightnessChange(v)}
//     />
//     Contrast
//     <Slider
//       style={{ width: 200, margin: 15 }}
//       min={-100} max={100}
//       defaultValue={contrast}
//       onChange={(_, v) => onContrastChange(v)}
//     />
//     <Divider />
//     <Checkbox label="Invert" checked={isImageInverted} onCheck={onInvertToggle} />
//   </div>
// );

export default CephaloEditorToolbar;
