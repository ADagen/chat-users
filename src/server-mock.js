import { Server } from 'mock-socket';
import { allRandomEn } from 'people-names';
import sentence from 'random-sentence';
import { WS_SERVER_URL } from './constants';

const mockServer = new Server(WS_SERVER_URL);

let uidCounter = 0;

function createRandomUser() {
    return {
        id: uidCounter++,
        name: allRandomEn(),
        lastMessage: sentence(),
        lastTimestamp: Date.now() - 1e10 - Math.round(Math.random() * 1e8),
        unread: 0,
    }
}

// заполню редис случайными данными тысячи пользователей
// Элемент списка должен содержать:
//     1. Имя пользователя
//     2. Текст последнего сообщения
//     3. Дата последнего сообщения
//     4. Кол-во непрочитанных сообщений
const redis = Array(1000).fill(true).map(createRandomUser);

// обновление отдельного пользователя
function sendUpdate(payload) {
    const operation = 'UPDATE';
    mockServer.send(JSON.stringify({ operation, payload }));
}

// начальная отправка при подключении клиента
function sendInitial(payload) {
    const operation = 'INITIAL';
    mockServer.send(JSON.stringify({ operation, payload }));
}

function makeUXGreatAgain(target) {
    target.disabled = true;
    setTimeout(() => target.disabled = false, 500);
}

// тестовые кнопки:

// 1. Новое сообщение от пользователя, которого еще нет в списке
window.fromNewUser = function fromNewUser(sender) {
    makeUXGreatAgain(sender);
    const newUser = createRandomUser();
    newUser.lastTimestamp = Date.now();
    redis.unshift(newUser);
    sendUpdate(newUser);
};

// 2. Новое сообщение от одного из последних 10 собеседников
window.fromRecent = function fromRecent(sender) {
    makeUXGreatAgain(sender);
    const index = Math.floor(Math.random() * 10);
    const user = redis[index];
    redis.splice(index, 1);
    user.lastMessage = sentence();
    user.lastTimestamp = Date.now();
    redis.unshift(user);
    sendUpdate(user);
};

// 3. Новое сообщение от случайного пользователя
window.fromRandom = function fromRandom(sender) {
    makeUXGreatAgain(sender);
    const index = Math.floor(Math.random() * redis.length);
    const user = redis[index];
    redis.splice(index, 1);
    user.lastMessage = sentence();
    user.lastTimestamp = Date.now();
    redis.unshift(user);
    sendUpdate(user);
};

mockServer.on('connection', () => sendInitial(redis));
