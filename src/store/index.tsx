import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Observable } from 'rxjs';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import initSubscriber, { subscribe } from 'redux-subscriber';
import { get } from 'object-path';
import * as _ from 'lodash';

export const fetchUser = username => ({ type: 'FETCH_USER', payload: username });
const fetchUserFulfilled = payload => ({ type: 'FETCH_USER_FULFILLED', payload });

export const sendNewMessage = (username, message) => ({
    type: 'NEW_MESSAGE', payload: {
        id: Date.now(),
        recipient: username,
        message: message
    }
});

const USERS = {
    henry: {
        username: 'henry',
        online: false
    },
    john: {
        username: 'john',
        online: true
    }
};

// epic
const fetchUserEpic = action$ =>
    action$.ofType('FETCH_USER')
        .mergeMap(action =>
            Observable.from([USERS[action.payload]])
                .map(response => fetchUserFulfilled(response))
        );

const newMessageEpic = (action$) =>
    action$.ofType('NEW_MESSAGE')
        .flatMap(action =>
            
                Observable.of(fetchUserFulfilled({
                    username: action.payload.recipient,
                    online: true
                })));

// reducers
const users = (state = {}, action) => {
    switch (action.type) {
        case 'FETCH_USER_FULFILLED':
            const userUpdate = {};
            userUpdate[action.payload.username] = _.merge(
                state[action.payload.username] || {},
                action.payload
            );
            return _.merge({ ...state }, userUpdate);
        default:
            return state;
    }
};

const chats = (state = [], action) => {
    switch (action.type) {
        case 'NEW_MESSAGE':
            let newState = [...state];
            let exists = newState.map(thread => thread.id).indexOf(action.payload.id);
            return newState;
        default:
            return state;
    }
};


export const rootEpic = combineEpics(
    fetchUserEpic,
    newMessageEpic
);

export const rootReducer = combineReducers({
    users
});


const epicMiddleware = createEpicMiddleware(rootEpic);

function configureStore() {
    const store = createStore(
        rootReducer,
        applyMiddleware(epicMiddleware)
    );

    return store;
}

export const store = configureStore();

initSubscriber(store);

export function subscribeToUser(username: string, callback: (state: any) => void) {
    return subscribe('users.' + username, () => {
        callback(get(store.getState(), 'users.' + username));
    });
}