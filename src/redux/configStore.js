// @flow

import { createStore } from 'redux'
import reducer from './reducer'

// в расширениях стора только redux devtools
// само собой, подключать следует только для process.env.NODE_ENV === 'development'
const enhance = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = createStore(
    reducer,
    enhance,
);

export default store;
