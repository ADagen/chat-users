/**
 * @typedef {Object} UserData
 * @property {number} id
 * @property {string} name
 * @property {string} lastMessage
 * @property {number} lastTimestamp
 * @property {number} unread
 */
declare type UserData = {
    id: number,
    name: string,
    lastMessage: string,
    lastTimestamp: number,
    unread: number,
}

/**
 * @typedef {Array.<UserData>} Users
 */
declare type Users = Array<UserData>
