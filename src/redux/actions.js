// @flow

import actionTypes from './actionTypes';
import socketClient from '../utils/api';

/**
 * Тип-перечисление со всеми возможными типами команд (actions)
 * @typedef {string} ChatActionType
 */
export type ChatActionType = $Keys<typeof actionTypes>;

/**
 * Тип для команд (actions) чата
 * @typedef {string} ChatAction<T>
 */
export type ChatAction<T> = FluxAction<ChatActionType, T>

/**
 * Событие начальной загрузки списка (приходит от вебсокет-сервера)
 * @param {Array.<UserData>} users
 * @returns {ChatAction}
 */
export const loadUsers = (users: Users): ChatAction<Users> => ({
    type: actionTypes.LOAD_USERS,
    payload: users,
});

/**
 * Событие обновления пользователя (приходит от вебсокет-сервера)
 * @param {UserData} user
 * @returns {ChatAction}
 */
export const updateUser = (user: UserData): ChatAction<UserData> => ({
    type: actionTypes.UPDATE_USER,
    payload: user,
});

/**
 * Пользователь помечает сообщения собеседника id прочитанными
 *
 * TODO: работа с апи-утилитами - это сайд-эффект. Вызов `socketClient.send` уничтожает чистоту функции,
 * а actionCreators должны быть чистыми функциями по большому кол-ву причин (https://github.com/reactjs/redux/issues/1171),
 * одна из которых и самая важная, на мой взгляд - масштабирование.
 * При разрастании бизнес-логики всё равно потребуются какие-либо инструменты для организации потока управления.
 * Наиболее удобный инструмент для этого из экосистемы реакта - `redux-saga`.
 * Использую `redux-saga` во всех проектах на связке react+redux, но тут это будет оверинжинирингом.
 *
 * @param {number} id - идентификатор пользователя, чьи сообщения должны быть прочитаны
 * @returns {ChatAction}
 */
export const markAsRead = (id: number): ChatAction<number> => {
    const event = { operation: 'READ', payload: id };
    socketClient.send(JSON.stringify(event));
    return {
        type: actionTypes.MARK_AS_READ,
        payload: id,
    }
};
