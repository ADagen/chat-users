// @flow

import { createReducer } from 'redux-create-reducer';
import actionTypes from './actionTypes';
import type { ChatAction } from './actions';

/**
 * @typedef {Object} StoreState
 * @property {Array.<any>} users - список пользователей
 */
type StoreState = {
    users: Array<UserData>,
}

const initialState: StoreState = {
    users: [],
};

export default createReducer(initialState, {

    /**
     * Редьюсер на событие начальной загрузки списка пользователей
     */
    [actionTypes.LOAD_USERS](
        state: StoreState,
        action: ChatAction<Array<UserData>>,
    ): $Shape<StoreState> {
        const users = action.payload;

        // начальная сортировка, чтобы при получении данных можно было вставить
        // нового пользователя с наименьшими затратами времени/памяти
        users.sort((a: UserData, b: UserData) =>
            b.lastTimestamp - a.lastTimestamp
        );

        return { users };
    },

    /**
     * Редьюсер на обновление одного конкретного пользователя
     */
    [actionTypes.UPDATE_USER](
        state: StoreState,
        action: ChatAction<UserData>,
    ): $Shape<StoreState> {
        const users = state.users.slice();
        const updatedUser = action.payload;
        let unread: number = 0;

        // Проверка, что пользователь уже есть.
        // Если такой id есть, то вырезать его оттуда,
        // сохранив непрочитанные сообщения.
        const alreadyExists = users.findIndex(user => user.id === updatedUser.id);
        if (alreadyExists >= 0) {
            const user = users.splice(alreadyExists, 1)[0];
            unread = user.unread;
        }

        // Вставка.
        // Пройтись по массиву и определить ближайшее сообщение,
        // для которого время в новом сообщении будет новее.
        // Мы не можем просто вставить в начало, так как сеть/сервер могут выдавать любые задержки,
        // из-за чего сообщения могут приходить в произвольном порядке.
        let targetIndex: number = 0;
        users.every((user, index) => {
            const isUpdatedUserOlder = updatedUser.lastTimestamp > user.lastTimestamp;
            if (!isUpdatedUserOlder) { targetIndex = index }
            return isUpdatedUserOlder;
        });
        // Обновить непрочитанные сообщения и вставить в массив
        unread += 1;
        const next = Object.assign({}, updatedUser, { unread });
        users.splice(targetIndex, 0, next);

        return { users };
    },

    /**
     * Установка сообщения прочитанным
     */
    [actionTypes.MARK_AS_READ](
        state: StoreState,
        action: ChatAction<number>,
    ): $Shape<StoreState> {
        const users = state.users.slice();
        const id = action.payload;

        const userToRead = users.find(user => user.id === id);
        if (userToRead) {
            userToRead.unread = 0;
            return { users };
        }

        return state;
    }

});