import React from 'react';
import Dialog from 'material-ui/Dialog';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { pure } from 'recompose';
import { hasResultValue as isViewableResultWithValue } from 'analyses/helpers';
import map from 'lodash/map';
import groupBy from 'lodash/groupBy';

interface AnalysisResultsViewerProps {
  onCloseRequested: () => any;
  open: boolean;
  results: ViewableAnalysisResult[];
}

export const AnalysisResultsViewer = pure(({ open, onCloseRequested, results }: AnalysisResultsViewerProps) => (
  <Dialog open={open} onRequestClose={onCloseRequested} >
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
            Severity
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
        map(groupBy(results, r => r.name), (results, name) => (
          <TableRow key={name}>
            <TableRowColumn>
              {name}
            </TableRowColumn>
            <TableRowColumn>
              {results[0].indicates}
            </TableRowColumn>
            <TableRowColumn>
              {results[0].severity}
            </TableRowColumn>
            <TableRowColumn>{
              map(results, (result) => {
                if (isViewableResultWithValue(result)) {
                  return result.relevantComponents.map(r => (
                    <div key={r.symbol}>{r.symbol} = {r.value.toFixed(1)}</div>
                  ));
                }
                return '-';
              })
            }</TableRowColumn>
            <TableRowColumn>{
              map(results, result => {
                if (isViewableResultWithValue(result)) {
                  return result.relevantComponents.map(r => (
                    <div key={r.symbol}>{r.norm}{r.stdDev ? `±${r.stdDev.toFixed(0)}` : ''}</div>
                  ));
                }
                return '-';
              })
            }</TableRowColumn>
          </TableRow>
        ))
      }
      </TableBody>
    </Table>
  </Dialog>
));

export default AnalysisResultsViewer;