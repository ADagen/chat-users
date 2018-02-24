// @flow

import * as React from 'react';
import ReactDOM from 'react-dom';
import './mock';
import './index.css';
import List from './List';
import { WS_SERVER_URL } from './constants'

const chatSocket = new WebSocket(WS_SERVER_URL);

chatSocket.onmessage = (event) => {
    console.log('INCOMING MESSAGE:', event, event.data);
};

const root = document.getElementById('root');
root && ReactDOM.render(<List />, root);
