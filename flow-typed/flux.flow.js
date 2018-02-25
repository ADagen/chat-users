/**
 * Содержит вспомогательные типы для flux, например типы для команд (actions)
 */

/**
 * Describes type for Flux Standard Action
 * @see {@link https://github.com/reduxactions/flux-standard-action}
 * @typedef {Object} FluxAction<T>
 * @property {string} type
 * @property {T} payload
 * @property {any} [meta]
 */
export type FluxAction<Type, Payload> = $Exact<{
    +type: Type,
    payload: Payload,
    meta?: any,
}>;

/**
 * Specifies type for error action
 * @typedef {FluxAction<T>} FluxErrorAction
 * @property {string} type
 * @property {Error} payload
 * @property {any} [meta]
 * @property {boolean} error
 */
export type FluxErrorAction<Type> = FluxAction<Type, Error> & {
    error: boolean,
};
