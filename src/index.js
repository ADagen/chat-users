// @flow

import * as React from 'react';
import ReactDOM from 'react-dom';
import './server-mock';
import List from './components/List';
import { WS_SERVER_URL } from './constants';
import store from './redux/configStore';
import { newMessage } from './redux/actions';
import './index.css';

store.subscribe(() =>
    console.log('STORE CHANGE', store.getState())
);

const chatSocket = new WebSocket(WS_SERVER_URL);

chatSocket.onmessage = (event: any) => {
    console.log('INCOMING MESSAGE:', event, event.data);
    store.dispatch(newMessage(event.data));
};

const root = document.getElementById('root');
root && ReactDOM.render(<List />, root);
