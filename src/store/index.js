import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from "redux-thunk";

import userRecordReducer from './userRecord/reducer'
export const store = createStore(
    combineReducers(
        {
            UserRecord: userRecordReducer
        }
    ),
    applyMiddleware(thunk));