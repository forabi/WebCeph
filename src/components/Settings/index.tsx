import * as React from 'react';
import Props from './props';

import Dialog from 'material-ui/Dialog';

import { Dropdown, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';

import map from 'lodash/map';

import { supportedLocales } from 'utils/config';
import { getNativeNameForLocale, getPrimaryLang } from 'utils/locale';

import {
  injectIntl,
  InjectedIntl,
  defineMessages,
} from 'react-intl';

type InjectedIntlProps = {
  intl: InjectedIntl;
};

const messageDescriptors = defineMessages({
  label_language: {
    id: 'label_language',
    defaultMessage: 'Language',
  },
});

class Settings extends React.PureComponent<Props & InjectedIntlProps, { }> {
  handleLocaleChange: IDropdownProps['onChanged'] = ({ key }) => {
    if (key === 'auto') {
      this.props.onLocaleUnset();
    } else {
      this.props.onLocaleChange(key as string);
    }
  }

  render() {
    const languages = map(supportedLocales, (key) => {
      return {
        key,
        text: (
          getNativeNameForLocale(key) ||
          getNativeNameForLocale(getPrimaryLang(key)!) ||
          key
        ),
      };
    });
    const options = [
      { text: 'Auto', key: 'auto' },
      ...languages,
    ];
    const { intl: { formatMessage } } = this.props;
    return (
      <Dialog open>
        <h2>Settings</h2>
        <div>
          <Dropdown
            label={formatMessage(messageDescriptors.label_language)}
            selectedKey={this.props.currentUserPreferredLocale || 'auto'}
            onChanged={this.handleLocaleChange}
            options={options}
          />
        </div>
      </Dialog>
    );
  }
}

export default injectIntl(Settings);
