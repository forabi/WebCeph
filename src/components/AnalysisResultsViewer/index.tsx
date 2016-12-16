import React from 'react';

import Dialog from 'material-ui/Dialog';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import { pure } from 'recompose';

import map from 'lodash/map';

import Props from './props';

import {
  mapCategoryToString,
  mapIndicationToString,
} from './strings';

export const AnalysisResultsViewer = pure(({ open, onRequestClose, results }: Props) => (
  <Dialog open={open} onRequestClose={onRequestClose} >
    <Table>
      <TableHeader displaySelectAll={false}>
        <TableRow>
          <TableHeaderColumn>
            Result
          </TableHeaderColumn>
          <TableHeaderColumn>
            Value
          </TableHeaderColumn>
          <TableHeaderColumn>
            Calculated
          </TableHeaderColumn>
          <TableHeaderColumn>
            Norm
          </TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
    {map(results, ({ category, indication, relevantComponents }) => (
        <TableRow key={category}>
          <TableRowColumn>
            {mapCategoryToString(category) || '-'}
          </TableRowColumn>
          <TableRowColumn>
            {mapIndicationToString(indication) || '-'}
          </TableRowColumn>
          <TableRowColumn>
          {map(relevantComponents, ({ symbol, value }) => (
            <div key={symbol}>
              {symbol} = {value.toLocaleString('en-US')}
            </div>
          ))}
          </TableRowColumn>
          <TableRowColumn>
          {map(relevantComponents, ({ symbol, mean, max, min }) => (
            <div key={symbol}>
              -{(mean - min).toLocaleString('en-US')},
              <b>{mean.toLocaleString('en-US')}</b>,
              +{(max - mean).toLocaleString('en-US')},
            </div>
          ))}
          </TableRowColumn>
        </TableRow>
      ))}
      </TableBody>
    </Table>
  </Dialog>
));

export default AnalysisResultsViewer;
