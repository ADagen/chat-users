// @flow

import * as React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './server-mock';
import './utils/api';
import List from './components/List';
import store from './redux/configStore';
import './index.css';

const root = document.getElementById('root');
const app = <Provider store={store}><List /></Provider>;
root && ReactDOM.render(app, root);
