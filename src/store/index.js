import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from "redux-thunk";

import userRecordReducer from './userRecord/reducer'

//combine the reducers into single store and export them
export const store = createStore(
    combineReducers(
        {
            UserRecord: userRecordReducer
        }
    ),
    applyMiddleware(thunk)
);