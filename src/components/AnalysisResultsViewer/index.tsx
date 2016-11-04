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
      {
        map(results, ({ category, indication, relevantComponents }) => (
          <TableRow key={category}>
            <TableRowColumn>
              {mapCategoryToString(category) || '-'}
            </TableRowColumn>
            <TableRowColumn>
              {mapIndicationToString(indication) || '-'}
            </TableRowColumn>
            <TableRowColumn>{
              map(relevantComponents, ({ symbol, value }) => (
                <div key={symbol}>
                  {symbol} = {value.toFixed(1)}
                </div>
              ))
            }</TableRowColumn>
            <TableRowColumn>{
              map(relevantComponents, ({ stdDev, symbol, norm }) => (
                <div key={symbol}>
                  {norm}
                  {stdDev ? `±${stdDev.toFixed(0)}` : ''}
                </div>
              ))
            }</TableRowColumn>
          </TableRow>
        ))
      }
      </TableBody>
    </Table>
  </Dialog>
));

export default AnalysisResultsViewer;
