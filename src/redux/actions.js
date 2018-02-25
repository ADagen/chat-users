// @flow

import actionTypes from './actionTypes'

type Message = {

}

/**
 * Тип-перечисление со всеми возможными типами команд (actions)
 * @typedef {string} ChatActionType
 */
export type ChatActionType = $Keys<typeof actionTypes>;

/**
 *
 */
type ChatAction<T> = FluxAction<ChatActionType, T>

export const newMessage = (msg: Message): ChatAction<Message> => ({
    type: actionTypes.NEW_MESSAGE,
    payload: msg,
});