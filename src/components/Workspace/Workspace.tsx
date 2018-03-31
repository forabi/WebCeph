import React from 'react';
import styles from './Workspace.module.css';
import { FormattedMessage } from 'react-intl';

export const Workspace = () => (
  <div className={styles.workspace}>
    <FormattedMessage
      id="workspaceCallout"
      defaultMessage="To get started, drop a new cephalogram or a previously traced WebCeph file here"
    />
  </div>
);
