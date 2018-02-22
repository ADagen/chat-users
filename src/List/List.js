// @flow

import * as React from 'react';
import User from '../User';
import './List.css';

const user = {
    name: 'ТестИмя',
    text: 'Съешь ещё этих мягких французских булочек, да выпей чаю',
    date: Date.now(),
    unread: 8,
};

/**
 * Общий класс приложения
 * @class List
 */
const List: React.ComponentType<*> = () => (
    <React.Fragment>
        {Array(10000).fill(true).map((_, i) => (
            <User key={i} {...user} />
        ))}
    </React.Fragment>
);

export default List;
