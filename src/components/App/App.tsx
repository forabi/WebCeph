import React from 'react';
import './App.global.css';
import styles from './App.module.css';
import { Workspace } from 'components/Workspace/Workspace';

export const App = () => (
  <div className={styles.app}>
    <div className={styles.workspace}>
      <Workspace />
    </div>
    <div className={styles.sidebar}>Sidebar</div>
    <div className={styles.toolbar}>Toolbar</div>
  </div>
);
