// @flow

/**
 * Тип стейта стора
 * @typedef {Object} StoreState
 * @property {Array.<any>} users - список пользователей
 */
type StoreState = {
    users: Array<any>,
}

const initialState = {
    users: [],
};

export default (state: StoreState = initialState, action: FluxAction<any>) => {
    return state;
}
