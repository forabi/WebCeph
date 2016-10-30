import * as React from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import CircularProgress from 'material-ui/CircularProgress';
import MenuItem from 'material-ui/MenuItem';
import Props from './props';
import { pure } from 'recompose';
import map from 'lodash/map';
import { getNameForAnalysis } from './strings';

const AnalysisSelector = pure(({ className, isLoading, currentAnalysisId, onChange, analyses }: Props) => (
  <div>
    <DropDownMenu disabled={isLoading}
      className={className}
      value={currentAnalysisId}
      onChange={(_, __, value) => onChange(value)}
      autoWidth={false}
    >
      {
        map(analyses, (id) => (
          <MenuItem key={id} value={id} primaryText={getNameForAnalysis(id)} />
        ))
      }
    </DropDownMenu>
    { isLoading ? <CircularProgress size={16} /> : null }
  </div>
));

export default AnalysisSelector;
