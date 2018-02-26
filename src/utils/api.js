// @flow

import '../server-mock';
import store from '../redux/configStore';
import { loadUsers, updateUser } from '../redux/actions';
import { WS_SERVER_URL } from '../constants';

const operationToActionMap = {
    INITIAL: loadUsers,
    UPDATE: updateUser,
};

/**
 * Общий обработчик при получении события от вебсокета
 * @param {MessageEvent} event
 */
function handleMessage(event: MessageEvent) {
    const data: string = String(event.data);
    const message = JSON.parse(data);
    console.log('[API] Incoming message:', message);

    const { operation, payload } = message;
    const action = operationToActionMap[operation];

    store.dispatch(action(payload));
}

const chatSocket = new WebSocket(WS_SERVER_URL);
chatSocket.onmessage = handleMessage;

function send(data: any) {
    console.log('[API] Sending message:', data);
    chatSocket.send(JSON.stringify(data));
}

export default { send };
