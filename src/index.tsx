import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from 'components/App/App';

const rootEl = document.getElementById('container');

ReactDOM.render(<App />, rootEl);
