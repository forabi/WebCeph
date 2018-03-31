import React from 'react';
import './App.global.css';
import styles from './App.module.css';

export const App = () => (
  <div className={styles.app}>
    <div className={styles.workspace}>
      To start tracing, drop a cephalogram here
    </div>
    <div className={styles.sidebar}>Sidebar</div>
    <div className={styles.toolbar}>Toolbar</div>
  </div>
);
