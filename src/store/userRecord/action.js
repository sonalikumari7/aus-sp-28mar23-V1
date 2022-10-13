export const SET_USER = "SET_USER";
export const GET_USER = "GET_USER";
export const SET_UPDATE_DATA = "SET_UPDATE_DATA";
export const SET_RESET_FLAG = "SET_RESET_FLAG";
export const SET_RESET_ITEM = "SET_RESET_ITEM";
export const SET_ALL_LIST = "SET_ALL_LIST";
export const CLEAR_UPDATE_DATA = "CLEAR_UPDATE_DATA"
export const SET_KPI = "SET_KPI"

export const LoadUserRecord = (status, id) => (dispatch, getState) => {
    return new Promise((resolve, reject) => {
        // let url = process.env.REACT_APP_ENV === "dev" ? 'http://127.0.0.1:4005/app_start' : window.getWebAppBackendUrl('app_start');

        // fetch(`${process.env.REACT_APP_URL}/${status}/${id}`).
        fetch(window.getWebAppBackendUrl('getData/' + id)).

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
        // fetch(`${process.env.REACT_APP_URL}/filterlist`).
        fetch(window.getWebAppBackendUrl('filterlist')).

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

    return new Promise((resolve, reject) => {
        const content = {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain',
                'Content-Type': 'application/json;charset=UTF-8'
            },

            body: JSON.stringify(data)

        }

        // fetch(`${process.env.REACT_APP_URL}/update`, content)
        fetch(window.getWebAppBackendUrl('update'), content)
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
    return new Promise((resolve, reject) => {


        const content = {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain',
                'Content-Type': 'application/json;charset=UTF-8'
            },

            body: JSON.stringify(data)

        }

        // fetch(`${process.env.REACT_APP_URL}/reset`, content)
        fetch(window.getWebAppBackendUrl('reset'), content)
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
    return new Promise((resolve, reject) => {
        // fetch(`${process.env.REACT_APP_URL}/refresh/${id}`).
        fetch(window.getWebAppBackendUrl('refresh/' + id)).
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
    return new Promise((resolve, reject) => {

        // fetch(`${process.env.REACT_APP_URL}/info`).
        fetch(window.getWebAppBackendUrl('info')).
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

        // fetch(`${process.env.REACT_APP_URL}/getcsv/${id}`).
        fetch(window.getWebAppBackendUrl('getgtcstemplatecsv/' + id)).
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

        // fetch(`${process.env.REACT_APP_URL}/getcsv/${id}`).
        fetch(window.getWebAppBackendUrl('getfinancereviewcsv/' + id)).
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