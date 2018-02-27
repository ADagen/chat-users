// @flow

import * as React from 'react';
import './User.css';
import { USER_HEIGHT } from '../../constants';
import { dateFormatter } from '../../utils/formatters';

/**
 * @typedef {UserData} UserOuterProps
 * @property {number} globalIndex
 */
export type UserOuterProps = UserData & {
    globalIndex: number,
}

/**
 * @typedef {UserOuterProps} UserInnerProps
 * @property {number} globalIndex
 * @property {function(number): any} markAsRead
 * @property {function(void): void} read
 */
export type UserInnerProps = UserOuterProps & {
    markAsRead: (id: number) => any,
    read: void => void,
}

/**
 * Элемент списка пользователей чата, выводящий информацию об отдельном пользователе.
 * 
 * globalIndex передаётся извне для правильной отработки css-анимации,
 * чтобы анимируемые при перемещении (когда приходит сообщение) элементы были всегда наверху.
 * Установка z-index не добавляет никакого пенальти для производительности, т.к.:
 * 1. Каждый div.User-root уже в своём слое
 * 2. z-index у конкретного .User-root меняется только тогда, когда меняется его позиция в списке
 * (например приходит сообщение).
 * 
 * @class User
 * @param {UserInnerProps} props
 */
const User: React.ComponentType<UserInnerProps> = ({
    globalIndex,
    id,
    name,
    lastMessage,
    lastTimestamp,
    unread,
    read,
}) => {
    const top: number = globalIndex * USER_HEIGHT;
    const zIndex: number = 1e6 - globalIndex;
    const style = { top, zIndex };
    const unreadText = unread ? `, непрочитано: ${unread}` : null;
    return (
        <div className="User-root" style={style} onClick={read}>
            <div className="User-row">
                <span className="User-name">{name}</span>{unreadText}
            </div>
            <div className="User-row">
                <div className="User-date">{dateFormatter(lastTimestamp)}:&nbsp;</div>
                <div className="User-text">{lastMessage}</div>
            </div>
        </div>
    )
};

export default User;
