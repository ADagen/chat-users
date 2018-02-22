// @flow

import * as React from 'react';
import './User.css';

type UserProps = {
    name: string, // Имя пользователя
    text: string, // Текст последнего сообщения
    date: number, // Дата последнего сообщения
    unread: number, // Кол-во непрочитанных сообщений
}

function dateFormatter(date: number): string {
    return new Date(date).toLocaleString();
}

/**
 * Элемент списка пользователей чата, выводящий информацию об отдельном пользователе.
 * @class User
 */
const User: React.ComponentType<UserProps> = ({
    name,
    text,
    date,
    unread,
}) => (
    <div className="User-root">
        <div className="User-row">
            <span className="User-name">{name}</span>, непрочитано: {unread}
        </div>
        <div className="User-row">
            <div className="User-date">{dateFormatter(date)}:&nbsp;</div>
            <div className="User-text">{text}</div>
        </div>
    </div>
);

export default User;
