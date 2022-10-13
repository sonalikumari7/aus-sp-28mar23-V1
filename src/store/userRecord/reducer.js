import * as Actions from './action'

let defaultState = {
    isFetching: false,
    userRecord: [],
    updateRecords: [],
    selectedReset: [],
    kpiData: []
}

const reducers = (state = defaultState, action) => {
    switch (action.type) {
        case Actions.GET_USER: {
            return {
                ...state,
                isFetching: false,
                userRecord: action.userData
            }
        }

        case Actions.SET_USER: {
            return {
                ...state,
                isFetching: false,
                userRecord: action.userData
            }
        }

        case Actions.SET_RESET_FLAG: {
            return {
                ...state,
                isFetching: action.flag
            }
        }

        case Actions.SET_KPI: {
            return {
                ...state,
                kpiData: action.kpi
            }
        }

        case Actions.CLEAR_UPDATE_DATA: {
            const userRec = state.userRecord
            if (action.userRecord.length > 0) {
                action.userRecord.forEach(p => {
                    let urInd = userRec.findIndex(r => r?.id_18char__opportunity_product === p?.["id_18char__opportunity_product"])
                    userRec[urInd] = p
                })
            }
            return {
                ...state,
                updateRecords: [],
                userRecord: userRec
            }
        }

        case Actions.SET_UPDATE_DATA: {
            const updateRec = state.updateRecords
            // let urIndex = updateRec.findIndex(r => r[0] === action.updateRecords[0])
            let urIndex = updateRec.findIndex(r => r?.id_18char__opportunity_product === action.updateRecords["id_18char__opportunity_product"])
            if (urIndex <= -1) {
                updateRec.push(action.updateRecords)
            }
            else {
                updateRec[urIndex] = action.updateRecords
            }
            return {
                ...state,
                updateRecords: updateRec
            }
        }

        case Actions.SET_ALL_LIST: {
            const updateRec = state.userRecord
            let urIndex = updateRec.findIndex(r => r.id_18char__opportunity_product === action.userData.id_18char__opportunity_product)
            if (urIndex <= -1) {
                updateRec.push(action.userData)
            }
            else {
                updateRec[urIndex] = action.userData
            }
            return {
                ...state,
                userRecord: updateRec
            }
        }

        default:
            return state;
    }
}


export default reducers;