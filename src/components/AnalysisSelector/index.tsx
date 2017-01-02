import * as React from 'react';

import CircularProgress from 'material-ui/CircularProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import map from 'lodash/map';
import { pure } from 'recompose';

import Props from './props';
import { getNameForAnalysis } from './strings';

const AnalysisSelector = pure(({ className, isLoading, currentAnalysisId, onChange, analyses }: Props) => {
  const setAnalysis = (_: any, __: any, value: AnalysisId<ImageType>) => onChange(value, 'ceph_lateral');
  return (
    <div>
      <DropDownMenu
        disabled={isLoading}
        className={className}
        value={currentAnalysisId}
        onChange={setAnalysis}
        autoWidth={false}
      >
        {
          map(analyses, (id) => (
            <MenuItem key={id} value={id} primaryText={getNameForAnalysis(id)} />
          ))
        }
      </DropDownMenu>
      {isLoading ? <CircularProgress size={16} /> : null}
    </div>
  );
});

export default AnalysisSelector;
