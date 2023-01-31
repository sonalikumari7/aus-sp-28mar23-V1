//defining actions
export const SET_USER = "SET_USER";
export const GET_USER = "GET_USER";
export const SET_UPDATE_DATA = "SET_UPDATE_DATA";
export const SET_RESET_FLAG = "SET_RESET_FLAG";
export const SET_RESET_ITEM = "SET_RESET_ITEM";
export const SET_ALL_LIST = "SET_ALL_LIST";
export const CLEAR_UPDATE_DATA = "CLEAR_UPDATE_DATA";
export const SET_KPI = "SET_KPI";

const REACT_APP_URL = "http://localhost:5000"; //comment for local run

export const LoadUserRecord = (status, id) => (dispatch, getState) => {
    //API to fetch data
    return new Promise((resolve, reject) => {
        // fetch(window.getWebAppBackendUrl('getData/' + id)).
        fetch(`${REACT_APP_URL}/getData/${id}`).    //comment for local run
            then(async (response) => {
                if (response.ok) {
                    const json = await response.json()
                    dispatch(setUserRecordsInStateAction(JSON.parse(json['Data']['Data'])))
                    resolve(json)
                }
            }).
            catch(err => {
                console.log("ERROR:", err)
                reject();
            })
    })
}


export const LoadOpportunityClient = () => (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        // fetch(window.getWebAppBackendUrl('filterlist')).
        fetch(`${REACT_APP_URL}/filterlist`). //comment for local run
            then(async (response) => {
                if (response.ok) {
                    const json = await response.json()
                    resolve(json)
                }
            }).
            catch(err => {
                console.log("ERROR:", err)
                reject();
            })
    })
}

export const updateInfoRecords = (data) => (dispatch, getState) => {
    //API to update edited records
    return new Promise((resolve, reject) => {
        const content = {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain',
                'Content-Type': 'application/json;charset=UTF-8'
            },

            body: JSON.stringify(data)

        }

        // fetch(window.getWebAppBackendUrl('update'), content)
        fetch(`${REACT_APP_URL}/update`, content) //comment for local run
            .then(async (response) => {
                if (response.ok) {
                    const json = await response.json();
                    dispatch(clearUpdateInfoStateToDispatchDataAction(data))
                    resolve(json);
                }
            }, () => {
                reject();
            })
            .catch(err => {
                console.log('ERROR: ', err);
                reject();
            });
    });
}


export const resetData = (data) => (dispatch, getState) => {
    //API to reset selected records
    return new Promise((resolve, reject) => {
        const content = {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain',
                'Content-Type': 'application/json;charset=UTF-8'
            },

            body: JSON.stringify(data)

        }

        // fetch(window.getWebAppBackendUrl('reset'), content)
        fetch(`${REACT_APP_URL}/reset`, content) //comment for local run
            .then(async (response) => {
                if (response.ok) {
                    const json = await response.json();
                    resolve(json);
                }
            }, () => {
                reject();
            })
            .catch(err => {
                console.log('ERROR: ', err);
                reject();
            });
    })
}

export const refreshData = (id) => (dispatch, getState) => {
    //API to refresh data
    return new Promise((resolve, reject) => {
        // fetch(window.getWebAppBackendUrl('refresh/' + id)).
        fetch(`${REACT_APP_URL}/refresh/${id}`). //comment for local run
            then(async (response) => {
                if (response.ok) {
                    const json = await response.json()
                    dispatch(setUserRecordsInStateAction(JSON.parse(json['Data']['Data'])))
                    resolve(json)
                }
            }).
            catch(err => {
                console.log("ERROR:", err)
                reject();
            })
    })
}


export const getUserInfo = () => (dispatch, getState) => {
    //API to get user info
    return new Promise((resolve, reject) => {
        // fetch(window.getWebAppBackendUrl('info')).
        fetch(`${REACT_APP_URL}/info`). //comment for local run
            then(async (response) => {
                if (response.ok) {
                    const json = await response.json()
                    resolve(json)
                }
            }).
            catch(err => {
                console.log("ERROR:", err)
                reject();
            })
    })
}

export const ExportGTCSTemplateFile = (id) => (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        // fetch(window.getWebAppBackendUrl('getgtcstemplatecsv/' + id)).
        fetch(`${REACT_APP_URL}/getcsv/${id}`). //comment for local run
            then(response => response.blob()).then(blob => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url;
                a.download = 'GTCS Upload Template.csv'
                document.body.appendChild(a)
                a.click();
                a.remove();
            }).
            catch(err => {
                console.log("ERROR:", err)
                reject();
            })
    })
}

export const ExportFinanceReviewFile = (id) => (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        // fetch(window.getWebAppBackendUrl('getfinancereviewcsv/' + id)).
        fetch(`${REACT_APP_URL}/getcsv/${id}`). //comment for local run
            then(response => response.blob()).then(blob => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url;
                a.download = 'Finance Review.csv'
                document.body.appendChild(a)
                a.click();
                a.remove();
            }).
            catch(err => {
                console.log("ERROR:", err)
                reject();
            })
    })
}

export const changeStateToDispatchData = (data) => (dispatch, getState) => {
    dispatch(setchangeStateToDispatchDataAction(data))
}

export const SetUserRecord = (data) => (dispatch, getState) => {
    dispatch(setUserRecordsInStateAction(data))
}

export const SetAllListUpdate = (data) => (dispatch, getState) => {
    dispatch(setAllListDataInStateAction(data))
}

export function userRecordsInStateAction(userData) {
    return {
        type: GET_USER,
        userData
    }
}

export const resetFlag = (flag) => (dispatch, getState) => {
    dispatch(setResetFlag(flag))
}

export const updateKPIStateToDispatchData = (data) => (dispatch, getState) => {
    dispatch(setKPIResult(data))
}

export function setResetFlag(flag) {
    return {
        type: SET_RESET_FLAG,
        flag
    }
}

export function setKPIResult(data) {
    return {
        type: SET_KPI,
        kpi: data
    }
}

export function setUserRecordsInStateAction(userData) {
    return {
        type: SET_USER,
        userData
    }
}

export function setAllListDataInStateAction(userData) {
    return {
        type: SET_ALL_LIST,
        userData
    }
}

export function setchangeStateToDispatchDataAction(updateData) {

    return {
        type: SET_UPDATE_DATA,
        updateRecords: updateData
    }
}

export function clearUpdateInfoStateToDispatchDataAction(data) {

    return {
        type: CLEAR_UPDATE_DATA,
        updateRecords: [],
        userRecord:data
    }
}