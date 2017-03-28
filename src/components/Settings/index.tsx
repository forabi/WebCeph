import * as React from 'react';
import Props from './props';

import { Redirect } from 'react-router-dom';

import Dialog from 'material-ui/Dialog';

import map from 'lodash/map';

import { supportedLocales } from 'utils/config';

class Settings extends React.PureComponent<Props, { }> {
  handleLocaleChange = (e) => {
    const newLocale = e.target.value;
    if (newLocale === 'auto') {
      this.props.onLocaleUnset();
    } else {
      this.props.onLocaleChange(newLocale);
    }
  }

  render() {
    return (
      <Dialog open onRequestClose={/* @TODO */}>
        <h2>Settings</h2>
        <div>
          <label>
            Language:
            <select value={this.props.currentUserPreferredLocale || 'auto'} onChange={this.handleLocaleChange}>
              <option value="auto">Auto</option>
              {map(supportedLocales, (value) => (
                <option value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </Dialog>
    );
  }
}

export default Settings;
