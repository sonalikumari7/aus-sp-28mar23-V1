import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tab, Tabs } from '@material-ui/core'
import React, { useEffect, useRef, useState } from 'react'
import TabConfigJson from '../../assets/json/config.json'
import logo from '../../assets/images/logo.png'
import './ViewTabs.css'
import { Tooltip } from "antd"
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import HighlightIcon from '@material-ui/icons/HighlightOff'
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import { useDispatch, useSelector } from 'react-redux'
import { resetData, resetFlag, updateInfoRecords, getUserInfo, LoadOpportunityClient, LoadUserRecord, ExportGTCSTemplateFile, ExportFinanceReviewFile, ExportLegalReviewFile, refreshData } from '../../store/userRecord/action';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ViewDataTable from '../ViewTable/ViewDataTable';
import { filterColumnDropDown, filteringColumnSelection,filteringColumnSelectionGlobal, KPICalculation } from '../../utility/util'
import { MultiSelect } from 'primereact/multiselect'
import PnLAnalysis from '../P&L Analysis'


var selectedResetValues = []; //rows selected to reset
var filterSelectionList = {}; //filters selected

function ViewTabs() {
    const [value, setValue] = useState(0); //state to store selected tab
    const [open, setOpen] = useState(false);
    const [isValidation, setIsValidation] = useState(false);
    const [isloading, setIsloading] = useState(false);
    const updateStateInfo = useSelector(state => state); //state from store
    const [userName, setUserName] = useState(undefined);
    const [warningMessage, setWarningMessage] = useState("");
    const [btnDisableStatus, setBtnDisableStatus] = useState(true);
    const [opportunityInfo, setOpportunityInfo] = useState({});
    const [opportunityProductList, setOpportunityProductList] = useState([]);
    const [selectedOpportunityName, setSelectedOpportunityName] = useState([]);
    const [selectedResetValue, setSelectedResetValue] = useState([]);

    const [selectedBUList, setSelectedBUlist] = useState([]);
    const [selectedFCodeList, setSelectedFCodelist] = useState([]);
    const [selectedProductDescriptionList, setSelectedProductDescriptionlist] = useState([]);
    const [selectedMarketStatusList, setSelectedMarketStatuslist] = useState([]);
    const [selectedBrandMangerList, setSelectedBrandManagerlist] = useState([]);
    const [selectedIntentToBidList, setSelectedIntentToBidlist] = useState([]);
    const [countValidationError, setCountValidationError] = useState({ "bidErrorCount": null, "rebateValueErrorCount": null });

    const [intentToBidUpdateCounter, setIntentToBidUpdateCounter] = useState(0); //counter to update intent to bid dropdown values

    const dispatch = useDispatch();

    const [mainFilterList, setMainFilterList] = useState({
        'business_unit_name': [],
        'local_item_code': [],
        'market_status': [],
        'local_product_description': [],
        'brand_manager': [],
        'intent_to_bid': []
    });
    const [filterBUList, setFilterBUList] = useState({
        "BUList": [],
        "LocalList": [],
        "MarketList": [],
        "FTSRisk": [],
        "NCPCogs": []
    });
    const [productInfo, setProductInfo] = useState(
        {
            "total_revenue": 0,
            "total_margin": 0,
            "overall_percentage": 0,
            "discount": 0
        }
    );

    //to dynamically update values of global intent to bid dropdown whenever the counter value increases
    useEffect(()=>{
        let uniqueIntentValues = JSON.parse(sessionStorage.getItem("intentToBidValues"));
        if (uniqueIntentValues){
            mainFilterList.intent_to_bid = uniqueIntentValues.map((val)=>{
                return {
                    field:val,
                    header:val,
                    keyName:"intent_to_bid"
                }
            });
        }
    },[intentToBidUpdateCounter])

    //  This code is for creating reusable data table component
    const TabPanel = (info) => {
        const { index, type, type: { view } } = info;
        return (
            <div>
                {
                    value === index && (
                        <ViewDataTable type={type}
                            onSelectedResetItem={handleSelectedReset}
                            opportunityProduct={opportunityProductList}
                            filterBULists={filterBUList}
                            selectedResetList={selectedResetValue}
                            handleFilterProductCalculation={filterProductCalculation}
                            intentToBidUpdater = {setIntentToBidUpdateCounter} />
                            
                    )
                }
            </div>
        )
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSelectedReset = (selectedItem) => {
        //update selected rows to be reset
        selectedResetValues = selectedItem;
        setSelectedResetValue(selectedResetValues);
    }

    const handleReset = () => {
        if (selectedResetValues.length > 0) {
            setWarningMessage(`You have selected ${selectedResetValues.length} product's, Do you really want to reset data ?`);
        } else {
            setWarningMessage('Are you sure, you want to reset data?');
        }
        setOpen(true);
    }

    const handleRefresh = () => {
        //API call to refresh the data
        setIsloading(true);
        dispatch(refreshData(selectedOpportunityName)).then(res => {
            sessionStorage.removeItem("inputDetail");
            setOpen(false);
            selectedResetValues = [];
            fetchData(selectedOpportunityName);
            toast.success("Sucessfully Refresh Data");
            setIsloading(false);

        }).catch(error => {
            console.log("ERROR:", error);
            toast.error("Failed to Reset data");
            setOpen(false);
            setIsloading(false);
        })
    }

    useEffect(() => {
        //check if any record has been updated. if yes, update the sessionStorage and enable the reset button.
        if (updateStateInfo.UserRecord.updateRecords.length > 0) {
            let tempInputData = JSON.parse(sessionStorage.getItem("inputDetail"));
            if (tempInputData !== null) {
                let uniqueList = Array.from([...tempInputData, ...updateStateInfo.UserRecord.updateRecords]
                    .reduce((map, obj) => map.set(obj.id_18char__opportunity_product, obj), new Map()).values());
                sessionStorage.setItem("inputDetail", JSON.stringify(uniqueList));
            } else {
                sessionStorage.setItem("inputDetail", JSON.stringify(updateStateInfo.UserRecord.updateRecords));
            }

            setProductInfo(KPICalculation(updateStateInfo.UserRecord.kpiData));
            setBtnDisableStatus(false);
        } else {
            setBtnDisableStatus(true);
        }
    }, [updateStateInfo])

    useEffect(() => {
        let opp_id = window.location.pathname.split("/").pop();
        if (opp_id !== 'view') {
            setSelectedOpportunityName(opp_id);
            fetchUserName();
            fetchData(opp_id);

            //update global filter values if filter is already applied and update filterSelectionList
            let tempFilters = sessionStorage.getItem("filterGlobal");
            if (tempFilters && tempFilters.length>0){
                tempFilters = tempFilters.replaceAll("(","").replaceAll(")","").replaceAll("item[","").replaceAll("]","").replaceAll("'","").trimEnd().split(" && ");
                let tempBuFilters = [];
                let tempBrandManagerFilters = [];
                let tempIntentToBidFilters = [];
                let tempFCodeFilters = [];
                let tempMarketStatusFilters = [];
                let tempProductDescriptionFilters = [];
                tempFilters.map(item=>{
                    let [field,value] = item.split(" === ");
                    
                    if (field === "brand_manager"){
                        tempBrandManagerFilters.push({
                            field:value,
                            header:value,
                            keyName:field
                        });
                        filterSelectionList[`${field.toString()}`] = tempBrandManagerFilters;
                    } else if (field === "market_status"){
                        tempMarketStatusFilters.push({
                            field:value,
                            header:value,
                            keyName:field
                        });
                        filterSelectionList[`${field.toString()}`] = tempMarketStatusFilters;
                    } else if (field === "business_unit_name"){
                        tempBuFilters.push({
                            field:value,
                            header:value,
                            keyName:field
                        });
                        filterSelectionList[`${field.toString()}`] = tempBuFilters;
                    } else if (field === "local_item_code"){
                        tempFCodeFilters.push({
                            field:value,
                            header:value,
                            keyName:field
                        });
                        filterSelectionList[`${field.toString()}`] = tempFCodeFilters;
                    } else if (field === "local_product_description"){
                        tempProductDescriptionFilters.push({
                            field:value,
                            header:value,
                            keyName:field
                        });
                        filterSelectionList[`${field.toString()}`] = tempProductDescriptionFilters;
                    } else if (field === "intent_to_bid"){
                        tempIntentToBidFilters.push({
                            field:value,
                            header:value,
                            keyName:field
                        });
                        filterSelectionList[`${field.toString()}`] = tempIntentToBidFilters;
                    }
                })
                setSelectedBUlist([...tempBuFilters]);
                setSelectedFCodelist([...tempFCodeFilters]);
                setSelectedBrandManagerlist([...tempBrandManagerFilters]);
                setSelectedMarketStatuslist([...tempMarketStatusFilters]);
                setSelectedProductDescriptionlist([...tempProductDescriptionFilters]);
                setSelectedIntentToBidlist([...tempIntentToBidFilters]);
            }
        }
    }, [])

    const fetchUserName = () => {
        dispatch(getUserInfo()).then(r => {
            setUserName(r.Data);
        }).catch(error => {
            console.log("ERROR:", error);
        })
    }

    function filterProductCalculation(info) {
        setProductInfo(info);
    }

    function handleClose(value) {
        if (value === "yes") {
            //reset the selected records
            const resetInfo = {
                "id": selectedOpportunityName,
                "data": selectedResetValues
            };

            setIsloading(true);
            dispatch(resetData(resetInfo)).then(res => {
                let tempInputData = JSON.parse(sessionStorage.getItem("inputDetail"));
                if (tempInputData !== null) {
                    let uniqueList = tempInputData.filter(r => !selectedResetValues.some(p => p.id_18char__opportunity_product === r.id_18char__opportunity_product));
                    sessionStorage.setItem("inputDetail", JSON.stringify(uniqueList));
                }
                setOpen(false);
                selectedResetValues = [];
                setSelectedResetValue([]); //for reset counter value to be 0 after every reset
                fetchData(selectedOpportunityName);
                toast.success("Sucessfully Reset Data");
                setIsloading(false);

            }).catch(error => {
                console.log("ERROR:", error);
                toast.error("Failed to Reset data");
                setOpen(false);
                setIsloading(false);
            })
        }
        else {
            setOpen(false);
        }
    };


    const handleSave = () => {
        //API call to save updated records
        let data = sessionStorage.getItem("inputDetail");
        setIsloading(true);
        dispatch(updateInfoRecords({ "data": JSON.parse(data) })).then(res => {
            toast.success("Sucessfully Update Data");
            sessionStorage.removeItem("inputDetail");
            setIsloading(false);
        }).catch(error => {
            console.log(error);
            toast.error("Failed to Update data");
            setIsloading(false);
        })
    }

    const fetchData = (id) => {
        //API call to fetch data for opportunity id
        const excel_name = "excel1.csv";
        setIsloading(true);
        dispatch(LoadUserRecord(excel_name, id)).then(res => {
            setOpportunityInfo(JSON.parse(res['Data']['Data'])[0]);
            const tempResponse = JSON.parse(res['Data']['Data']);
            const changeInputData = sessionStorage.getItem("inputDetail");
            if (changeInputData !== null) {
                JSON.parse(changeInputData).forEach(r => {
                    let ind = tempResponse.findIndex((el) => el['id_18char__opportunity_product'] === r['id_18char__opportunity_product']);
                    tempResponse[ind] = r;
                })
                setBtnDisableStatus(false);
            }
            let filterData = filteringColumnSelectionGlobal(tempResponse, []);
            setOpportunityProductList(tempResponse);
            // KPICalculation(tempResponse)
            setProductInfo(KPICalculation(filterData));
            let tempResBu = [...new Set((tempResponse).map(r => r['business_unit_name']))].map(p => { return { "field": p, "header": p, "keyName": 'business_unit_name' } });
            let tempResLocalCode = [...new Set((tempResponse).map(r => r['local_item_code']))].map(p => { return { "field": p, "header": p, "keyName": 'local_item_code' } });
            let tempMarketStatus = [...new Set((tempResponse).map(r => r['market_status']))].map(p => { if (p === null) { return { "field": 'Blank', "header": 'Blank', "keyName": 'market_status' } } return { "field": p, "header": p, "keyName": 'market_status' } });
            let tempFTS = [...new Set((tempResponse).map(r => r['fts_risk']))].map(p => { if (p === null) { return { "field": 'Blank', "header": 'Blank', "keyName": 'fts_risk' } } return { "field": p, "header": p, "keyName": 'fts_risk' } });
            let tempNcp = [...new Set((tempResponse).map(r => r['ncp_cogs']))].map(p => { if (p === null) { return { "field": 'Blank', "header": 'Blank', "keyName": 'ncp_cogs' } } return { "field": p, "header": p, "keyName": 'ncp_cogs' } });

            for (let i in mainFilterList) {
                mainFilterList[i] = [];
            }
            const uniqueList = [];
            const filteringList = ['business_unit_name', 'local_item_code', 'market_status', 'local_product_description', 'brand_manager', 'intent_to_bid'];
            tempResponse.forEach(x => {
                filteringList.forEach(p => {
                    if (!uniqueList[x[p]]) {
                        if (x[p] === null) {
                            mainFilterList[p].push({ "field": 'Blank', "header": 'Blank', "keyName": p });
                            uniqueList[x[p]] = true;
                        }
                        else {
                            mainFilterList[p].push({ "field": x[p], "header": x[p], "keyName": p });
                            uniqueList[x[p]] = true;
                        }
                    }
                })
            })

            let tempDropdownList = {
                "BUList": tempResBu,
                "LocalList": tempResLocalCode,
                "MarketList": tempMarketStatus,
                "FTSRisk": tempFTS,
                "NCPCogs": tempNcp
            };
            setFilterBUList(tempDropdownList);
            setIsloading(false);
        })
    }

    const exportGTCSTemplateCSV = () => {
        dispatch(ExportGTCSTemplateFile(selectedOpportunityName)).then(r => {
            // console.log(r)
        }).catch(err => {
            console.log("ERROR..", err)
        })
    }

    const exportFinanceReviewCSV = () => {
        dispatch(ExportFinanceReviewFile(selectedOpportunityName)).then(r => {
            // console.log(r)
        }).catch(err => {
            console.log("ERROR..", err)
        })
    }

    const exportLegalReviewCSV = () => {
        dispatch(ExportLegalReviewFile(selectedOpportunityName)).then(r => {
            // console.log(r)
        }).catch(err => {
            console.log("ERROR..", err)
        })
    }

    const clearFilter = () => {
        //function to clear filters
        setSelectedBUlist([]);
        setSelectedFCodelist([]);
        setSelectedProductDescriptionlist([]);
        setSelectedMarketStatuslist([]);
        setSelectedBrandManagerlist([]);
        setSelectedIntentToBidlist([]);
        filterSelectionList={};

        for (let i in mainFilterList) {
            mainFilterList[i] = [];
        }
        const uniqueList = [];
        const filteringList = ['business_unit_name', 'local_item_code', 'market_status', 'local_product_description', 'brand_manager', 'intent_to_bid'];
        opportunityProductList.forEach(x => {
            filteringList.forEach(p => {
                if (!uniqueList[x[p]]) {
                    if (x[p] === null) {
                        mainFilterList[p].push({ "field": 'Blank', "header": 'Blank', "keyName": p });
                        uniqueList[x[p]] = true;
                    }
                    else {
                        mainFilterList[p].push({ "field": x[p], "header": x[p], "keyName": p });
                        uniqueList[x[p]] = true;
                    }
                }
            })
        })
        dispatch(resetFlag(true));
    }

    const filterFunction = (e, keyname) => {
        //function to apply filters and update other filter dropdown options
        // if all or no option is selected, filterSelectionList for that column name would be "", hence all filters will be removed
        filterSelectionList[`${keyname.toString()}`] = e.value;
        let filterCount = 0;
        for (let fl in filterSelectionList) {
            filterCount += filterSelectionList[fl].length;
        }
        if (filterCount === 0) {
            sessionStorage.removeItem("filter");
        }
        let filterList = filteringColumnSelectionGlobal(opportunityProductList, filterSelectionList);
        if (keyname === 'business_unit_name') {
            setSelectedBUlist(e.value);
        }
        else if (keyname === 'local_item_code') {
            setSelectedFCodelist(e.value);
        } else if (keyname === 'local_product_description') {
            setSelectedProductDescriptionlist(e.value);
        } else if (keyname === 'market_status') {
            setSelectedMarketStatuslist(e.value);
        } else if (keyname === 'brand_manager') {
            setSelectedBrandManagerlist(e.value);
        } else if (keyname === 'intent_to_bid') {
            setSelectedIntentToBidlist(e.value);
        }
        setProductInfo(KPICalculation(filterList));

        const uniqueList = [];
        for (let i in mainFilterList) {
            if (i !== keyname) {
                mainFilterList[i] = [];
            }
        }  
        const filteringList = ['business_unit_name', 'local_item_code', 'market_status', 'local_product_description', 'brand_manager', 'intent_to_bid'];
        filterList.forEach(x => {
            filteringList.forEach(p => {
                if (p !== keyname) {
                    if (!uniqueList[x[p]]) {
                        if (x[p] === null) {
                            mainFilterList[p].push({ "field": 'Blank', "header": 'Blank', "keyName": p });
                            uniqueList[x[p]] = true;
                        }
                        else {
                            mainFilterList[p].push({ "field": x[p], "header": x[p], "keyName": p });
                            uniqueList[x[p]] = true;
                        }
                    }
                }

            })

        })
    }

    const checkValidation = () => {
        //check if updated records satisfy the validation rules
        let uniqueList = [];
        const sessionStoreUpdateRecord = JSON.parse(sessionStorage.getItem("inputDetail"));
        if (sessionStoreUpdateRecord !== null) {
            uniqueList = Array.from([...updateStateInfo.UserRecord.userRecord, ...sessionStoreUpdateRecord,]
                .reduce((map, obj) => map.set(obj.id_18char__opportunity_product, obj), new Map()).values());
        }
        let validArray = uniqueList.length > 0 ? uniqueList : updateStateInfo.UserRecord.userRecord;
        let countBidPriceValueMissing = 0;
        let countRebateValueMissing = 0;
        validArray.forEach(r => {
            if (r['new_contract_price'] === null) {
                countBidPriceValueMissing = countBidPriceValueMissing + 1;
            }
            if (r['new_contract_price'] !== null && r['product_rebate'] === 'Yes' && r['rebate_value'] === null) {
                countRebateValueMissing = countRebateValueMissing + 1;
            }
        })
        setCountValidationError({ bidErrorCount: countBidPriceValueMissing, rebateValueErrorCount: countRebateValueMissing });
        setIsValidation(true);
    }

    return (
        <div>
            <div>
                {
                    isloading === true ? (<CircularProgress className="loader" />) : null
                }

            </div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">RESET CONFIRMATION</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {warningMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { handleClose("no") }} color="primary">
                        NO
                    </Button>
                    <Button onClick={() => { handleClose("yes") }} color="primary" autoFocus>
                        YES
                    </Button>
                </DialogActions>
            </Dialog>

            <div>
                <Dialog
                    open={isValidation}
                    //  onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth={true}
                    maxWidth={'md'}

                >
                    <div className="validation-section" id="alert-dialog-description-validation-info">
                        {
                            countValidationError.bidErrorCount === 0 && countValidationError.rebateValueErrorCount === 0
                                ?
                                (
                                    <div>
                                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                            <CheckCircleOutlineOutlinedIcon style={{ fontSize: '4rem', color: 'rgb(146,207,137)' }} />
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <strong >Everything is correctly entered in records</strong>
                                        </div>
                                    </div>
                                )
                                :
                                (
                                    <div>
                                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                            <ErrorOutlineOutlinedIcon style={{ fontSize: '4rem', color: 'rgb(248,138,140)' }} />
                                        </div>
                                        <div>
                                            <div style={{ textAlign: 'center' }}>
                                                <strong >Validation Checks</strong>
                                            </div>
                                            <ul>
                                                <li>Bid price is missing for <span style={{ color: 'rgb(248,138,140)', fontSize: '1.3rem' }}>
                                                    {countValidationError.bidErrorCount}</span> out of
                                                    <span style={{ fontSize: '1.rem' }}> {opportunityProductList.length}</span>
                                                </li>
                                                <li>There are <span style={{ color: 'rgb(248,138,140)', fontSize: '1.3rem' }}>{countValidationError.rebateValueErrorCount} </span>
                                                    records with rebate = Yes, but no rebate value assigned</li>
                                            </ul>
                                        </div>
                                    </div>
                                )
                        }



                    </div>
                    <DialogActions>
                        <Button onClick={() => { setIsValidation(false) }} color="primary" autoFocus>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#000484', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex' }}>
                    <div>
                        <img src={logo} width="120px" height="50px" style={{ paddingLeft: '12px', paddingTop: '3px', paddingRight: '10px' }} />
                    </div>
                    <div>
                        <Tabs value={value}
                            onChange={handleChange}
                            TabIndicatorProps={{
                                style: { background: "white" }
                            }}
                        >
                            {
                                TabConfigJson['Tabs'].map((t, i) => (<Tab style={{ color: 'white', fontSize: 15, fontWeight: 700 }} key={i} label={t.tab_name} />))
                            }
                        </Tabs>
                    </div>
                </div>
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginRight: '5rem' }}
                        endIcon={<HighlightIcon />}
                        onClick={handleReset}
                        disabled={selectedResetValues.length > 0 ? false : true}
                    >
                        RESET
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginRight: '5px' }}
                        endIcon={<RotateLeftIcon />}
                        onClick={handleRefresh}
                    >
                        REFRESH
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={<SaveOutlinedIcon />}
                        onClick={handleSave}
                        disabled={btnDisableStatus}
                    >
                        SAVE
                    </Button>
                    <span className="username">{userName}</span>
                </div>
            </div>

            
            {value === 3 ? (
                <div>
                    <PnLAnalysis data={opportunityProductList}/>
                </div>
            ): (
                <div>
                    <div className="main-filter-section">
                        <div className="main-filter-container">
                            <div>Business Unit</div>
                            <div>
                                <MultiSelect value={selectedBUList} options={mainFilterList.business_unit_name}
                                    maxSelectedLabels={1} placeholder={"All"} style={{ width: '12rem', height: '30px' }} optionLabel="header"
                                    filter onChange={(e) => filterFunction(e, 'business_unit_name')} />
                            </div>
                        </div>
                        <div className="main-filter-container">
                            <div>F Code</div>
                            <div>

                                <MultiSelect value={selectedFCodeList} options={mainFilterList.local_item_code}
                                    maxSelectedLabels={1} placeholder={"All"} style={{ width: '12rem', height: '30px' }} optionLabel="header"
                                    filter onChange={(e) => filterFunction(e, 'local_item_code')} />
                            </div>
                        </div>
                        <div className="main-filter-container">
                            <div>Product Description</div>
                            <div>
                                <MultiSelect value={selectedProductDescriptionList} options={mainFilterList.local_product_description}
                                    scrollHeight='40vh' placeholder={"All"} maxSelectedLabels={1} style={{ width: '12rem', height: '30px' }} optionLabel="header"
                                    filter onChange={(e) => filterFunction(e, 'local_product_description')} />
                            </div>
                        </div>
                        <div className="main-filter-container">
                            <div>Market Status</div>
                            <div>

                                <MultiSelect value={selectedMarketStatusList} options={mainFilterList.market_status}
                                    maxSelectedLabels={1} placeholder={"All"} style={{ width: '12rem', height: '30px', }} optionLabel="header"
                                    filter onChange={(e) => filterFunction(e, 'market_status')} />
                            </div>
                        </div>
                        <div className="main-filter-container">
                            <div>Brand Manager</div>
                            <div>

                                <MultiSelect value={selectedBrandMangerList} options={mainFilterList.brand_manager}
                                    maxSelectedLabels={1} placeholder={"All"} style={{ width: '12rem', height: '30px', padding: '0px' }} optionLabel="header"
                                    filter onChange={(e) => filterFunction(e, 'brand_manager')} />
                            </div>
                        </div>
                        <div className="main-filter-container">
                            <div>Intent To Bid</div>
                            <div>

                                <MultiSelect value={selectedIntentToBidList} options={mainFilterList.intent_to_bid}
                                    maxSelectedLabels={1} placeholder={"All"} style={{ width: '12rem', height: '30px' }} optionLabel="header"
                                    filter onChange={(e) => filterFunction(e, 'intent_to_bid')} />
                            </div>
                        </div>
                        <div className="main-filter-container-buttons" style={{ color: '#7f6c6c', marginTop:"1rem" }} >
                            <span onClick={() => clearFilter()}>
                                <Button variant='outlined' style={{ color:"#000484", borderColor:"#000484", paddingInline:"0.5rem" }}>
                                    <i className="pi pi-filter-slash" style={{ marginLeft: '0rem', marginRight: '0.5rem' }} />
                                    Clear All Filters
                                </Button>
                            </span>
                            <span onClick={() => checkValidation()} style={{marginLeft:"1rem"}}>
                                <Button variant='outlined' style={{ color:"#000484", borderColor:"#000484", paddingInline:"0.5rem" }}>
                                    <i className="pi pi-question-circle" style={{ marginLeft: '0rem', marginRight: '0.5rem' }} />
                                    Validate
                                </Button>
                            </span>
                        </div>
                    </div>

                    <div className="info-section">
                        <div className="opportunity-info-section">
                            <div style={{display:"flex"}}>
                                <div style={{width:"60%"}}>
                                    <label>
                                        <span style={{ color: '#7f6c6c', fontSize:"0.9rem" }}>Opportunity Name:</span> {opportunityInfo?.opportunity_name}
                                    </label> <br/>
                                    <label>
                                        <span style={{ color: '#7f6c6c', fontSize:"0.9rem" }}>Customer Name:</span> {opportunityInfo?.customer_name}
                                    </label>
                                </div>
                                <div style={{width:"40%"}}>
                                    {opportunityInfo?.opportunity_name === undefined ? null : (
                                        <>
                                            {value === 0 ? (
                                                <span style={{ cursor: 'pointer' }} onClick={() => exportGTCSTemplateCSV(false)}>
                                                    <span style={{ color: '#7f6c6c' }}>GTCS Template:</span>
                                                    <i className="pi pi-download" style={{ marginLeft: '0.5rem', fontSize:"0.9rem" }} />
                                                </span>
                                            ): value === 1 ? (
                                                <span style={{ cursor: 'pointer' }} onClick={() => exportFinanceReviewCSV(false)}>
                                                    <span style={{ color: '#7f6c6c' }}>Finance Review Template:</span>
                                                    <i className="pi pi-download" style={{ marginLeft: '0.5rem', fontSize:"0.9rem"  }} />
                                                </span>
                                            ): value === 2 ? (
                                                <span style={{ cursor: 'pointer' }} onClick={() => exportLegalReviewCSV(false)}>
                                                <span style={{ color: '#7f6c6c' }}>Legal Template:</span>
                                                <i className="pi pi-download" style={{ marginLeft: '0.5rem', fontSize:"0.9rem"  }} />
                                            </span>
                                            ) : null}
                                            {/* <br/> */}
                                        </>
                                    )}
                                </div>
                            </div>
                            
                        </div>
                        <div className="product-info-section">
                            <div className="product-info-container">
                                <div>
                                    <span className="product-info-number">AU{productInfo.total_revenue}</span>
                                    <br />
                                    <span className="product-info-title">Total  Revenue</span>
                                </div>
                                <div>
                                    <span className="product-info-number">AU{productInfo.total_margin}</span>
                                    <br />
                                    <span className="product-info-title">Total Margin</span>
                                </div>
                                <div>
                                    <span className="product-info-number">{productInfo.overall_percentage} %</span>
                                    <br />
                                    <span className="product-info-title">Overall % Margin from MSP</span>
                                </div >
                                <div>
                                    <span className="product-info-number">{productInfo.discount} %</span>
                                    <br />
                                    <span className="product-info-title">Discount</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '5px', marginInline:"1rem" }}>
                        {/* <div style={{ color: '#7f6c6c', cursor: 'pointer' }} onClick={() => clearFilter()}>
                            <i className="pi pi-filter-slash" style={{ marginLeft: '1.5rem', marginRight: '0.5rem' }} />
                            Clear Filter
                        </div> */}
                        <div style={{width:"50% "}}>
                            <span style={{display:"flex", alignItems:"center"}}>
                                <i className="pi pi-info-circle" style={{ marginRight: '2px', fontSize:"0.9rem" }} />
                                <p style={{fontSize:"0.85rem", margin:"0.3rem"}}>Please click on 'Save' button every few minutes, to avoid losing your progress. Changes are not auto saved.</p>
                            </span>
                            <Tooltip
                            title={
                                <>
                                <ul style={{listStyle:"disc", paddingLeft:"0rem"}}>
                                    <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>By default, Net Bid Price is set to Chemist List Price. Please enter 'Bid Price' to reset it. </li>
                                    <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>If Intent to Bid is set to No, Bid Price is automatically set to Chemist List Price and rebates are locked. Any previously entered Rebates are removed.</li>
                                    <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>Bid Price should always be less than Chemist List Price. If user
                                        accidentally enters a Bid Price greater
                                        than Chemist List Price, Bid Price is automatically set to Chemist List Price.</li>
                                    <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>If Pfish Supply Constraint is Yes (Yellow), please refer Supply Overview Tab for details.</li>
                                    <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>If TGA Shortages is Yes (Yellow), please refer TGA Shortages Tab for details.</li>
                                </ul>
                                    {/* <span style={{ color: '#7f6c6c', fontSize: '12px' }}>
                                    <span>*</span>By default, Net Bid Price is set to Chemist List Price. Please enter 'Bid Price' to reset it. 
                                    </span>
                                    <br></br>
                                    <span style={{ color: '#7f6c6c', fontSize: '12px' }}>
                                    
                                    <span>*</span>If Intent to Bid is set to No, Bid Price is automatically set to Chemist List Price and rebates are locked. Any previously entered Rebates are removed.
                                    
                                    </span>
                                    <br></br>
                                    
                                    <span style={{ color: '#7f6c6c', fontSize: '12px' }}>
                                        <span>*</span>Bid Price should always be less than Chemist List Price. If user
                                        accidentally enters a Bid Price greater
                                        than Chemist List Price, Bid Price is automatically set to Chemist List Price.
                                    </span>
                                    <br></br>
                                    <br></br>
                                    <span style={{ color: '#7f6c6c', fontSize: '12px' }}>
                                        <span>*</span>If Pfish Supply Constraint is Yes (Yellow), please refer Supply Overview Tab for details.
                                    </span>
                                    <br></br>
                                    <span style={{ color: '#7f6c6c', fontSize: '12px' }}>
                                        <span>*</span>If TGA Shortages is Yes (Yellow), please refer TGA Shortages Tab for details.
                                    </span> */}
                                </>
                            }
                            overlayInnerStyle={{backgroundColor:"#ececec", width:"40rem", color:"black", fontSize:"0.85rem",opacity:0.95}}
                            placement="right"
                            color={"#ececec"}
                            className="tooltip-instructions"
                            >
                                <i className="pi pi-question-circle" style={{ marginRight: '5px', fontSize:"0.9rem" }} />
                                Hover here for general instructions
                            </Tooltip>
                        </div>
                        <div style={{ color: '#7f6c6c', fontSize: '12px', paddingLeft:"2rem", width:"50%" }}>
                            <span style={{ marginRight: '10px' }}><span className="legends-item" style={{ backgroundColor: 'rgb(146,207,137)' }}> </span>NBP &ge; MSP and NBP &gt; COGS  </span>
                            <span style={{ marginRight: '10px' }}><span className="legends-item" style={{ backgroundColor: 'rgb(242,226,136)' }}></span> NBP &ge; COGS and NBP &lt; MSP </span>
                            <span style={{ marginRight: '10px' }}><span className="legends-item" style={{ backgroundColor: 'rgb(248,138,140)' }}></span> NBP  &lt; COGS  </span>
                            <span style={{ marginRight: '10px' }}><span className="legends-item" style={{ backgroundColor: 'rgb(211,211,211)' }}></span> Insufficient info (Either CoGS or MSP could not be found)</span>
                            {/* <span>
                                <i className="pi pi-info-circle" style={{ marginRight: '10px' }} />
                                Please click on 'Save' button every few minutes, to avoid losing your progress. Changes are not auto saved.
                            </span> */}
                        
                        </div>
                    </div>
                </div>
            )}
            {
                TabConfigJson['Tabs'].map((t, i) => (<TabPanel key={i} value={value} index={i} type={t} />))
            }
            <ToastContainer />
        </div >
    )
}

export default ViewTabs
