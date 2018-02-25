import { Server } from 'mock-socket';
import { WS_SERVER_URL } from './constants';

const mockServer = new Server(WS_SERVER_URL);
// mockServer.on('connection', server => {
//     mockServer.send('test message 1');
//     mockServer.send('test message 2');
// });

const buttons = Array.from(document.getElementsByTagName('button'));
buttons.forEach((button, index) =>
    button.addEventListener('click', () => mockServer.send(`button ${index}`))
);
