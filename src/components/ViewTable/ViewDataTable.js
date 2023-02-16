import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { MultiSelect } from 'primereact/multiselect';
import { changeStateToDispatchData, LoadOpportunityClient, LoadUserRecord, resetFlag, resetItems, SetAllListUpdate, setResetFlag, updateInfo, updateKPIStateToDispatchData } from '../../store/userRecord/action';
import './ViewDataTable.css'
import { filterColumnDropDown, filteringColumnSelection, KPICalculation } from '../../utility/util';

var filterSelectionList = {}; // holds the filters selected
var currenFilterSelection = ''; // holds the current column on which filter is applied
var filterListGlobal = [];

function ViewDataTable(props) {
    const listcol = props.type.excel_config.product_details.selected_list; //default selected product details columns
    const { type: { tab_name } } = props;
    const selectResetList = props.selectedResetList; //selected rows for reset purpose
    const [selectedColumns, setSelectedColumns] = useState(listcol);

    //defining default values for filter dropdowns of different columns
    const statuses = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const product_rebate_list = [
        { field: 'Yes', header: 'Yes', 'keyName': 'product_rebate' },
        { field: 'No', header: 'No', 'keyName': 'product_rebate' }
    ];

    const supply_status_list = [
        { field: 'Yes', header: 'Yes', 'keyName': 'supply_status' },
        { field: 'No', header: 'No', 'keyName': 'supply_status' }
    ];

    const shortage_list = [
        { field: 'Yes', header: 'Yes', 'keyName': 'shortage' },
        { field: 'No', header: 'No', 'keyName': 'shortage' }
    ];

    const line_status_list = [
        { field: 'New Business', header: 'New Business', keyName: 'line_status' },
        { field: 'Incumbent', header: 'Incumbent', keyName: 'line_status' },
        { field: 'Single Source', header: 'Single Source', keyName: 'line_status' }
    ];

    const lineData = [
        { label: 'New Business', value: 'New Business' },
        { label: 'Incumbent', value: 'Incumbent' },
        { label: 'Single Source', value: 'Single Source' }
    ];

    const bidCategory = [
        {
            "label": "Documentation availability",
            "value": "Documentation availability"
        },
        {
            "label": "Finance constraints",
            "value": "Finance constraints"
        },
        {
            "label": "Fulfilled by another NDC",
            "value": "Fulfilled by another NDC"
        },
        {
            "label": "Launch delay",
            "value": "Launch delay"
        },
        {
            "label": "Legal constraints",
            "value": "Legal constraints"
        },
        {
            "label": "Not the right product/packaging specifications",
            "value": "Not the right product/packaging specifications"
        },
        {
            "label": "Not the full SKU range available",
            "value": "Not the full SKU range available"
        },
        {
            "label": "Other reasons",
            "value": "Other reasons"
        },
        {
            "label": "Our price not competitive",
            "value": "Our price not competitive"
        },
        {
            "label": "Price Sustainability",
            "value": "Price Sustainability"
        },
        {
            "label": "Strategic Decision",
            "value": "Strategic Decision"
        },
        {
            "label": "Supply availability",
            "value": "Supply availability"
        },
        {
            "label": "Single Source",
            "value": "Single Source"
        }
    ];

    const rebateType = [
        { label: 'Flat Percentage', value: 'Flat Percentage' },
        { label: 'Flat Value', value: 'Flat Value' }
    ];

    const commentOptions = [
        { label: 'Bid at Chemist List Price', value: 'Bid at Chemist List Price' },
        { label: 'Extend Current Contract Price', value: 'Extend Current Contract Price' },
        { label: 'Aspirational Bid', value: 'Aspirational Bid' },
        { label: 'Competitive Bid', value: 'Competitive Bid' },
        { label: 'Exploratory Bid', value: 'Exploratory Bid' },
        { label: 'Bid at Wholesaler List Price', value: 'Bid at Wholesaler List Price' },
        { label: 'Do not bid - Single Source', value: 'Do not bid - Single Source' },
        { label: 'Do not bid - Low Volumes', value: 'Do not bid - Low Volumes' },
        { label: 'Do not bid - MSP too high', value: 'Do not bid - MSP too high' },
        { label: 'Do not bid - Supply issues', value: 'Do not bid - Supply issues' },
        { label: 'Do not bid - Commercial decision', value: 'Do not bid - Commercial decision' },
        { label: 'Recent Winning Bid Price', value: 'Recent Winning Bid Price' },
    ]

    const dispatch = useDispatch(); //dispatch method for state management from redux store
    const dt = useRef(null);
    const stateObj = useSelector(state => state); //state from store
    const [isloading, setIsloading] = useState(false);

    const [value, setValue] = useState([]); //holds the current table
    const [selectedValue, setSelectedValue] = useState(selectResetList);
    const [defaultSelectionSorting, setDefaultSelectionSorting] = useState({ sortField: "", sortOrder: 1 });
    const [first1, setFirst1] = useState(0); //first record index
    const [rows2, setRows2] = useState(50); //default page size
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInputTooltip, setPageInputTooltip] = useState('Press \'Enter\' key to go to this page.'); //tooltip on page number input field
    const [mainData, setMainData] = useState([]); //holds the main original data. only updates when fields are updated.

    const [selectedBUlist, setSelectedBUlist] = useState([]);
    const [selectedLocalItemlist, setSelectedLocalItemlist] = useState([]);
    const [selectedMarketStatuslist, setSelectedMarketStatuslist] = useState([]);
    const [selectedProductRebatelist, setSelectedProductRebatelist] = useState([]);
    const [selectedLineStatuslist, setselectedLineStatuslist] = useState([]);
    const [selectedFTSList, setSelectedFTSList] = useState([]);
    const [selectedNCPList, setSelectedNCPList] = useState([]);
    const [selectedSupplyStatusList, setSelectedSupplyStatusList] = useState([]);
    const [selectedShortageList, setSelectedShortageList] = useState([]);

    const [buList, setBuList] = useState(props?.filterBULists?.BUList);
    const [localItemList, setLocalItemList] = useState(props?.filterBULists?.LocalList);
    const [marketStatusList, setMarketStatusList] = useState(props?.filterBULists?.MarketList);
    const [productRebatelist, setProductRebatelist] = useState(product_rebate_list);
    const [lineStatuslist, setLineStatuslist] = useState(line_status_list);
    const [ftsList, setFtsList] = useState(props?.filterBULists?.FTSRisk);
    const [ncpList, setNCPList] = useState(props?.filterBULists?.NCPCogs);
    const [supplyList, setSupplyList] = useState(supply_status_list);
    const [shortageList, setShortageList] = useState(shortage_list);

    useEffect(() => { // runs on every first render
        //since this component is being rerendered on every update, this useEffect is being executed on every render.
        // this part of code applies selected filter on the records and updates the filters  
        let filterList = filteringColumnSelection(props.opportunityProduct, filterSelectionList);
        filterListGlobal = filterList;
        let calculatResult = calculationField(filterList);
        setValue(calculatResult);
        // setMainData(calculatResult);
        setMainData(props.opportunityProduct);
        setFilterColumSelection();
        selctionFilterColumnList(filterList);

        //check for sorting applied, if any
        let returSelectionSortColum = JSON.parse(sessionStorage.getItem("sorting"));
        if (returSelectionSortColum !== null) {
            //if sorting is applied, sort the table array. If not sorted, indexing would cause issue in case of editing data
            setDefaultSelectionSorting(returSelectionSortColum);
            let sortArr = [];
            if (returSelectionSortColum.sortField === null) {
                sortArr = calculatResult.sort((a, b) => {
                    return a['id_18char__opportunity'].localeCompare(b['id_18char__opportunity']) || a['local_item_code'].localeCompare(b['local_item_code'])
                })
                setValue(sortArr);
            }
            else {
                //string comparison
                if (returSelectionSortColum.sortField === 'local_product_description' || returSelectionSortColum.sortField === 'business_unit_name') {
                    sortArr = calculatResult.sort((a, b) => {
                        if (returSelectionSortColum.sortOrder === -1) {
                            return b[returSelectionSortColum.sortField].localeCompare(a[returSelectionSortColum.sortField])
                        }
                        else {
                            return a[returSelectionSortColum.sortField].localeCompare(b[returSelectionSortColum.sortField])
                        }
                    });
                    setValue(sortArr);
                }
                else {
                    //numerical comparison
                    sortArr = calculatResult.sort((a, b) => {
                        if (returSelectionSortColum.sortOrder === -1) {
                            return b[returSelectionSortColum.sortField] - a[returSelectionSortColum.sortField]
                        }
                        else {
                            return a[returSelectionSortColum.sortField] - b[returSelectionSortColum.sortField]
                        }
                    });
                    setValue(sortArr);
                }
            }
        }

        //check for pagination
        let returnPagination = JSON.parse(sessionStorage.getItem("pagination"));
        if (returnPagination !== null) {
            setFirst1(returnPagination.first);
            setRows2(returnPagination.rows);
            setCurrentPage(returnPagination.currentPage);
        }
        // setKPIFunction(filterList)

        // always keep selected product details column in memory
        let tempSelectedProductDetailsColumns = JSON.parse(sessionStorage.getItem("selectedProductDetailsColumns"));
        if (tempSelectedProductDetailsColumns && tempSelectedProductDetailsColumns.length !== 0){
            setSelectedColumns([...tempSelectedProductDetailsColumns]);
        }
    }, []);

    useEffect(() => {
        //clear the filters whenever reset is done
        if (stateObj.UserRecord.isFetching) {
            clearCustomFilter();
        }
    }, [stateObj])

    const setFilterColumSelection = () => { 
        //sets the selected values for columns on which filters are applied
        for (let i in filterSelectionList) {
            if (i === 'business_unit_name') {
                setSelectedBUlist(filterSelectionList[i]);
            }
            else if (i === 'local_item_code') {
                setSelectedLocalItemlist(filterSelectionList[i]);
            }
            else if (i === 'market_status') {
                setSelectedMarketStatuslist(filterSelectionList[i]);
            }
            else if (i === 'product_rebate') {
                setSelectedProductRebatelist(filterSelectionList[i]);
            }
            else if (i === 'line_status') {
                setselectedLineStatuslist(filterSelectionList[i]);
            }
            else if (i === 'fts_risk') {
                setSelectedFTSList(filterSelectionList[i]);
            }
            else if (i === 'ncp_cogs') {
                setSelectedNCPList(filterSelectionList[i]);
            }
            else if (i === 'supply_status'){
                setSelectedSupplyStatusList(filterSelectionList[i]);
            }
            else if (i === 'shortage'){
                setSelectedShortageList(filterSelectionList[i]);
            }
        }
    }

    const columnFilterFunction = (e, val) => {
        //function which applies selected filter values on the table records
        filterSelectionList[`${val.toString()}`] = e.value;
        if (e.value.length === 0)
            sessionStorage.removeItem("filter");
        currenFilterSelection = val; //val is the keyname or the column name
        let temp = JSON.parse(JSON.stringify(mainData));
        let filterList = filteringColumnSelection([...temp], filterSelectionList);
        setValue(filterList); //update the table state

        //update dropdown options of other columns based on selections in current column
        if (val === 'local_item_code') {
            setSelectedLocalItemlist(e.value);
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (val === 'market_status') {
            setSelectedMarketStatuslist(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (val === 'business_unit_name') {
            setSelectedBUlist(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (val === 'product_rebate') {
            setSelectedProductRebatelist(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (val === 'line_status') {
            setselectedLineStatuslist(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (val === 'fts_risk') {
            setSelectedFTSList(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (val === 'ncp_cogs') {
            setSelectedNCPList(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (val === 'supply_status') {
            setSelectedSupplyStatusList(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
        }
        else if (val === 'shortage') {
            setSelectedShortageList(e.value);
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        props.handleFilterProductCalculation(KPICalculation([...filterList]));
    }

    const selctionFilterColumnList = (filterList) => {
        // update the filter dropdown options of the other columns based on the current column selection
        if (currenFilterSelection === 'local_item_code') {
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (currenFilterSelection === 'market_status') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (currenFilterSelection === 'business_unit_name') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (currenFilterSelection === 'product_rebate') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (currenFilterSelection === 'line_status') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (currenFilterSelection === 'fts_risk') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (currenFilterSelection === 'ncp_cogs') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
        else if (currenFilterSelection === 'supply_status') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setShortageList(filterColumnDropDown(filterList, 'shortage'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
        }
        else if (currenFilterSelection === 'shortage') {
            setLocalItemList(filterColumnDropDown(filterList, 'local_item_code'));
            setMarketStatusList(filterColumnDropDown(filterList, 'market_status'));
            setBuList(filterColumnDropDown(filterList, 'business_unit_name'));
            setProductRebatelist(filterColumnDropDown(filterList, 'product_rebate'));
            setFtsList(filterColumnDropDown(filterList, 'fts_risk'));
            setLineStatuslist(filterColumnDropDown(filterList, 'line_status'));
            setNCPList(filterColumnDropDown(filterList, 'ncp_cogs'));
            setSupplyList(filterColumnDropDown(filterList, 'supply_status'));
        }
    }

    const customColumFilter = (info) => {
        //custom template for filter dropdowns bsaed on type of colum
        if (info['field'] === 'local_item_code') {
            return (<MultiSelect value={selectedLocalItemlist} options={localItemList}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'local_item_code')} className="filter-dropdown" />
            )
        }
        else if (info['field'] === "market_status") {
            return (<MultiSelect value={selectedMarketStatuslist} options={marketStatusList}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'market_status')} className="filter-dropdown" />
            )
        }
        else if (info['field'] === "business_unit_name") {
            return (<MultiSelect value={selectedBUlist} options={buList}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'business_unit_name')} className="filter-dropdown" />
            )
        }

        else if (info['field'] === "product_rebate") {
            return (<MultiSelect value={selectedProductRebatelist} options={productRebatelist}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'product_rebate')} className="filter-dropdown" />
            )
        }

        else if (info['field'] === "line_status") {
            return (<MultiSelect value={selectedLineStatuslist} options={lineStatuslist}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'line_status')} className="filter-dropdown" />
            )
        }

        else if (info['field'] === "fts_risk") {
            return (<MultiSelect value={selectedFTSList} options={ftsList}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'fts_risk')} className="filter-dropdown" />
            )
        }

        else if (info['field'] === "ncp_cogs") {
            return (<MultiSelect value={selectedNCPList} options={ncpList}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'ncp_cogs')} className="filter-dropdown" />
            )
        }

        else if (info['field'] === "supply_status") {
            return (<MultiSelect value={selectedSupplyStatusList} options={supplyList}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'supply_status')} className="filter-dropdown" />
            )
        }

        else if (info['field'] === "shortage") {
            return (<MultiSelect value={selectedShortageList} options={shortageList}
                maxSelectedLabels={1} style={{ width: '2px', height: '44px' }} optionLabel="header"
                filter onChange={(e) => columnFilterFunction(e, 'shortage')} className="filter-dropdown" />
            )
        }
    }

    function numberFormatter(cellValue,type) {
        // returns formatted string of number based on its type- currency, quantity, percent or negative
        if (cellValue === null || cellValue === undefined || cellValue === "")
            return cellValue;

        let result = "";
        let isNegative = cellValue < 0 ? true : false;

        if (type === undefined){
            return cellValue;
        }
        else if (type === "currency"){
            result = cellValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
        else if (type === "revenue"){
            result = Math.round(cellValue).toLocaleString('en-US', { style: 'currency', currency: 'USD',maximumFractionDigits: 0 });
        }
        else if (type === "quantity"){
            result = Math.round(cellValue).toLocaleString('en-US');
        }
        else if (type === "percent"){
            result = String(cellValue)+"%";
        }

        if (isNegative){
            result = result.slice(1);
            result = "("+result+")";
        }
        return result;
    }

    function numberFormatterPVM(cellValue,type) {
        // returns formatted string of number based on its type- currency, quantity, percent or negative
        if (cellValue === null || cellValue === undefined || cellValue === "")
            return cellValue;

        let result = "";
        let isNegative = cellValue < 0 ? true : false;

        const formatter = Intl.NumberFormat("en-US", {
            notation: "compact",
            compactDisplay: "short",
        });

        if (type === undefined){
            return cellValue;
        }
        else if (type === "currency"){
            result = formatter.format(cellValue);
            if (isNegative){
                result = "-$" + result.slice(1);
            }
            else result = '$' + result;
        }
        else if (type === "quantity"){
            result = Math.round(cellValue)
            result = formatter.format(result);
        }
        else if (type === "percent"){
            result = String(cellValue)+"%";
        }

        if (isNegative){
            result = result.slice(1);
            result = "("+result+")";
        }
        return result;
    }

    function getColumnHeader(keyName, header) {
        //return column header based on whether filter is applied on it or not. If yes, append a reset icon with it.
        let temp = filterSelectionList[`${keyName.toString()}`]
        if (!temp || temp.length === 0){
            return <span>{header.toUpperCase()}</span>
        }
        else {
            return <span>
                        {header.toUpperCase()}
                        <br/>
                        <i className="pi pi-undo" style={{ fontSize:"0.85rem", cursor:"pointer" }} onClick={()=>{
                            columnFilterFunction({value:[]},keyName)
                        }} />
                </span>
        }
    }

    //columns for product details header
    const columnProductDetailList = value.length > 0 ? selectedColumns?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '75px', height: props.type.tab_name === "Finance Review" ? '100px' : null }}
                headerClassName="header-word-wrap product-detail-header"
                header={getColumnHeader(k.field,k.header)}
                sortable={k.sortable === undefined ? false : true}
                filter={k.filterby === undefined ? false : true}
                filterElement={k.filterby === undefined ? null : customColumFilter(k)}
                body = {(rowData)=>{
                   return numberFormatter(rowData[k.field],k.type)
                }}
            />
        )
    }) : null;

    //columns for bid details header
    const columnCurrentBidDetailList = value.length > 0 ? props.type.excel_config.current_bid_details?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '60px' }}
                headerClassName="header-word-wrap current-bid-header"
                header={k.header.toUpperCase()}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
                sortable={k.sortable === undefined ? false : true}
            />)
    }) : null;

    //columns for user input header
    const columnUserInputDetailList = value.length > 0 ? props.type.excel_config.user_input?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '60px' }}
                headerClassName="header-word-wrap user-input-header"
                header={getColumnHeader(k.field,k.header)}
                editor={props.type.tab_name === "Finance Review" ? null : (props) => codeEditor(props)}
                filter={k.filterby === undefined ? false : true}
                filterElement={k.filterby === undefined ? null : customColumFilter(k)}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    //columns for calculated fields header
    const columnCalculatedDetailList = value.length > 0 ? props.type.excel_config.calculated_fields?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '65px' }}
                headerClassName="header-word-wrap calculated-field-header"
                sortable={k.sortable === undefined ? false : true}
                header={getColumnHeader(k.field,k.header)}
                filter={k.filterby === undefined ? false : true}
                filterElement={k.filterby === undefined ? null : customColumFilter(k)}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    //columns for user comments header
    const columnUserCommentDetailList = value.length > 0 ? props.type.excel_config.user_comments?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={tab_name === "Finance Review" ? { width: '80px' } : { width: '55px' }}
                headerClassName="header-word-wrap comment-header"
                // header={k.header.toUpperCase()}
                header={getColumnHeader(k.field,k.header)}
                editor={props.type.tab_name === "Finance Review" ? null : (props) => codeEditor(props)}
                filter={k.filterby === undefined ? false : true}
                filterElement={k.filterby === undefined ? null : customColumFilter(k)}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    //columns for financial inputs in finance review tab
    const columnFinanceInputDetailList = value.length > 0 ? props.type.excel_config.finance_input?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '75px' }}
                headerClassName="header-word-wrap current-bid-header"
                header={getColumnHeader(k.field,k.header)}
                editor={props.type.tab_name === "Legal Template" ? null : (props) => codeEditor(props)}
                filter={k.filterby === undefined ? false : true}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    //columns for legal inputs in legal template tab
    const columnLegalInputDetailList = value.length > 0 ? props.type.excel_config.legal_input?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '100px' }}
                headerClassName="header-word-wrap current-bid-header"
                header={getColumnHeader(k.field,k.header)}
                editor={props.type.tab_name === "Finance Review" ? null : (props) => codeEditor(props)}
                filter={k.filterby === undefined ? false : true}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    const columnFinancialOverviewDetailList = value.length > 0 ? props.type.excel_config.financial_overview?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '75px' }}
                headerClassName="header-word-wrap current-bid-header"
                header={getColumnHeader(k.field,k.header)}
                editor={null}
                filter={k.filterby === undefined ? false : true}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    const columnFinancialsDetailList = value.length > 0 ? props.type.excel_config.financials?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '75px' }}
                headerClassName="header-word-wrap user-input-header"
                header={getColumnHeader(k.field,k.header)}
                editor={null}
                filter={k.filterby === undefined ? false : true}
                body = {(rowData)=>{
                    return numberFormatter(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    const columnPVMList = value.length > 0 ? props.type.excel_config.pvm?.map(k => {
        return (
            <Column key={k.field} field={k.field}
                headerStyle={{ width: '75px' }}
                headerClassName="header-word-wrap user-input-header"
                header={getColumnHeader(k.field,k.header)}
                sortable={k.sortable === undefined ? false : true}
                editor={null}
                filter={k.filterby === undefined ? false : true}
                body = {(rowData)=>{
                    return numberFormatterPVM(rowData[k.field],k.type)
                }}
            />)
    }) : null;

    const onEditorValueChange = (props, val) => {
        //update the table records after editing
        let upd = [...props.value];
        upd[props.rowIndex][props.field] = val;
        setValue(upd);
    }

    const calculationField = (productData) => {
        //sets the calculated fields for each record in the table
        productData.forEach(p => {
            // Setting default Net Bid Price (after rebates) to List Price (also called Chemist List Price or CLP)
            // If a 'New' Bid Price is entered in User Input field, provided the 'new' value is not blank AND is different from default value List Price it is 'set'
            let contractPrice;
            if (p['list_price'] !== p['new_contract_price'] && p['new_contract_price'] !== null) {
                contractPrice = p['new_contract_price'];
            } else if(p['list_price'] !== null){
                contractPrice = p['list_price'];
            } else{
                contractPrice = 0;
            }

            p['net_contract_price'] = contractPrice === 0 ? 0: parseFloat((contractPrice - p['rebate_value']).toFixed(2));
            p['total_revenue'] = contractPrice === 0 ? 0: parseFloat((p['net_contract_price'] * p['annual_usage_volume']).toFixed(2));
            p['margin_msp'] = p['net_contract_price'] === 0 || p['msp'] === null ? null: parseFloat((((p['net_contract_price'] - p['msp']) / p['net_contract_price']) * 100).toFixed(2));
            p['total_margin'] = p['net_contract_price'] === 0 || p['msp'] === null ? null : parseFloat(((p['net_contract_price'] - p['msp']) * p['annual_usage_volume']).toFixed(2));
            p['discount_to_clp'] = p['net_contract_price'] === 0 || p['list_price'] === null || p['list_price'] === 0 ? null : parseFloat(((1 - (p['net_contract_price'] / p['list_price'])) * 100).toFixed(2));
            p['fts_risk'] = p['discount_to_clp'] > 40 ? "Yes" : "No";
            p['bid_kam'] = p['net_contract_price'] >= p['kams_floor_price'] ? "Yes" : "No";
            if ( p['net_contract_price'] !== null && p['cost_gmx_current_year'] !== null && p['net_contract_price'] < p['cost_gmx_current_year']) {
                p['ncp_cogs'] = "Red";
            }
            else if (p['net_contract_price'] === null || p['net_contract_price'] ===0){
                p['ncp_cogs'] = "Net Bid Price not defined";
            }
            else if (p['cost_gmx_current_year'] ===null ){
                p['ncp_cogs'] = "CoGS Not Found";
            }
            else if (p['msp'] === null){
                p['ncp_cogs'] = "MSP Not Found";
            }            
            else if (p['net_contract_price'] >= p['cost_gmx_current_year'] && p['net_contract_price'] < p['msp']) {
                p['ncp_cogs'] = "Yellow";
            }
            else if (p['net_contract_price'] >= p['msp'] && p['net_contract_price'] > p['cost_gmx_current_year']) {
                p['ncp_cogs'] = "Green";
            }

            //add logic for calculating fields for pnl review tab
            p['net_revenue'] = parseFloat(( p['net_contract_price'] * p['annual_usage_volume']).toFixed(2));
            p['gross_revenue_percent'] = parseFloat((((p['net_revenue'] - p['total_cost_msp']) * 100)/p['net_revenue']).toFixed(2));
            p['gross_revenue_percent'] = isFinite(p['gross_revenue_percent']) ? p['gross_revenue_percent'] : 0;
            p['difference'] = parseFloat((p['prior_actual_revenue'] - p['net_revenue']).toFixed(2));
            p['pvm_due_to_qty'] = parseFloat(((p['prior_actual_qty'] - p['annual_usage_volume']) * p['prior_asp']).toFixed(2));
            p['pvm_due_to_price'] = parseFloat(((p['prior_asp'] -  p['net_contract_price']) * p['annual_usage_volume']).toFixed(2));
            let prob = 0;
            if (p['market_status'] === "Single Source")
                prob = 1;
            else if (p['gross_revenue_percent'] >= 50)
                prob = 0.75;
            else if (p['gross_revenue_percent'] >= 20)
                prob = 0.5;
            else prob = 0.25;
            p['probable_volume'] = parseFloat(( prob * p['annual_usage_volume']).toFixed(2));
            p['probable_revenue'] = parseFloat(( p['net_contract_price'] * p['probable_volume']).toFixed(2));            
        });
        return productData;
    }

    const onEditorComplete = (editorProps, val) => {
        //function that is executed after enter key is pressed after the edit
        if (editorProps.field === 'rebate_value' || editorProps.field === 'rebate_percentage') {
            let upd = [...value];
            let contractPrice;
            if (isNaN(parseFloat(val)) === true) {
                //check for non numerical values
                upd[editorProps.rowIndex]['rebate_percentage'] = null;
                upd[editorProps.rowIndex]['rebate_value'] = null;
            } else {
                val = val.replaceAll(",", "");
                if (editorProps.field === 'rebate_value') {
                    if (upd[editorProps.rowIndex]['list_price'] !== upd[editorProps.rowIndex]['new_contract_price'] && upd[editorProps.rowIndex]['new_contract_price'] !== null) {
                        contractPrice = upd[editorProps.rowIndex]['new_contract_price'];
                    } else if(upd[editorProps.rowIndex]['list_price']!== null){
                        contractPrice = upd[editorProps.rowIndex]['list_price'];
                    }
                    else {
                        contractPrice = 0;
                    }
                    upd[editorProps.rowIndex]['rebate_percentage'] = contractPrice === 0 || contractPrice === null ? null: parseFloat(((parseFloat(val) / contractPrice) * 100).toFixed(2));

                } else if (editorProps.field === 'rebate_percentage') {
                    if (upd[editorProps.rowIndex]['list_price'] !== upd[editorProps.rowIndex]['new_contract_price'] && upd[editorProps.rowIndex]['new_contract_price'] !== null) {
                        contractPrice = upd[editorProps.rowIndex]['new_contract_price'];
                    } else if(upd[editorProps.rowIndex]['list_price']!==null){
                        contractPrice = upd[editorProps.rowIndex]['list_price'];
                    }
                    else{
                        contractPrice = 0;
                    }
                    upd[editorProps.rowIndex]['rebate_value'] = contractPrice === 0 || contractPrice === null ? null: parseFloat((parseFloat(val) * (contractPrice / 100)).toFixed(2));
                }
            }

            upd[editorProps.rowIndex]['net_contract_price'] = contractPrice === 0 ? 0: upd[editorProps.rowIndex]['rebate_type'] === 'Flat Percentage' ? parseFloat((contractPrice - (parseInt(val) / 100 * contractPrice)).toFixed(2)) : parseFloat((contractPrice - (parseFloat(val))).toFixed(2));
            upd[editorProps.rowIndex]['total_revenue'] = parseFloat((upd[editorProps.rowIndex]['net_contract_price'] * upd[editorProps.rowIndex]['annual_usage_volume']).toFixed(2));
            upd[editorProps.rowIndex]['margin_msp'] = upd[editorProps.rowIndex]['net_contract_price'] === 0 || upd[editorProps.rowIndex]['msp'] === null ? null: parseFloat((((upd[editorProps.rowIndex]['net_contract_price'] - upd[editorProps.rowIndex]['msp']) / upd[editorProps.rowIndex]['net_contract_price']) * 100).toFixed(2));
            upd[editorProps.rowIndex]['total_margin'] = upd[editorProps.rowIndex]['net_contract_price'] === 0 || upd[editorProps.rowIndex]['msp'] === null ? null : parseFloat(((upd[editorProps.rowIndex]['net_contract_price'] - upd[editorProps.rowIndex]['msp']) * upd[editorProps.rowIndex]['annual_usage_volume']).toFixed(2));
            upd[editorProps.rowIndex]['discount_to_clp'] = upd[editorProps.rowIndex]['net_contract_price'] === 0 || upd[editorProps.rowIndex]['list_price'] === null || upd[editorProps.rowIndex]['list_price'] === 0 ? null : parseFloat(((1 - (upd[editorProps.rowIndex]['net_contract_price'] / upd[editorProps.rowIndex]['list_price'])) * 100).toFixed(2));
            upd[editorProps.rowIndex]['fts_risk'] = upd[editorProps.rowIndex]['discount_to_clp'] > 40 ? "Yes" : "No";
            upd[editorProps.rowIndex]['bid_kam'] = upd[editorProps.rowIndex]['net_contract_price'] >= upd[editorProps.rowIndex]['kams_floor_price'] ? "Yes" : "No";

            if ( upd[editorProps.rowIndex]['net_contract_price'] !== null && upd[editorProps.rowIndex]['cost_gmx_current_year'] !== null && upd[editorProps.rowIndex]['net_contract_price'] < upd[editorProps.rowIndex]['cost_gmx_current_year']) {
                upd[editorProps.rowIndex]['ncp_cogs'] = "Red";
            }
            else if (upd[editorProps.rowIndex]['net_contract_price'] === null || upd[editorProps.rowIndex]['net_contract_price'] ===0){
                upd[editorProps.rowIndex]['ncp_cogs'] = "Net Bid Price not defined";
            }
            else if (upd[editorProps.rowIndex]['cost_gmx_current_year'] === null ){
                upd[editorProps.rowIndex]['ncp_cogs'] = "CoGS Not Found";
            }
            else if (upd[editorProps.rowIndex]['msp'] === null){
                upd[editorProps.rowIndex]['ncp_cogs'] = "MSP Not Found";
            }
            else if (upd[editorProps.rowIndex]['net_contract_price'] >= upd[editorProps.rowIndex]['cost_gmx_current_year'] && upd[editorProps.rowIndex]['net_contract_price'] < upd[editorProps.rowIndex]['msp']) {
                upd[editorProps.rowIndex]['ncp_cogs'] = "Yellow";
            }
            else if (upd[editorProps.rowIndex]['net_contract_price'] >= upd[editorProps.rowIndex]['msp'] && upd[editorProps.rowIndex]['net_contract_price'] > upd[editorProps.rowIndex]['cost_gmx_current_year']) {
                upd[editorProps.rowIndex]['ncp_cogs'] = "Green";
            }
            setMainData(upd);
            setValue(upd);
            dispatch(updateKPIStateToDispatchData(upd));
            dispatch(changeStateToDispatchData(upd[editorProps.rowIndex]));
            dispatch(SetAllListUpdate(upd[editorProps.rowIndex]));
        }
        else if (editorProps.field === 'comments' || editorProps.field === 'line_status' ||
            editorProps.field === 'product_rebate' || editorProps.field === 'rebate_type' ||
            editorProps.field === 'intent_to_bid' || editorProps.field === 'bid_category' ||
            editorProps.field === 'finance_comments' || editorProps.field === 'finance_approved' ||
            editorProps.field === 'legal_comments' || editorProps.field === 'legal_approved') {
            let upd = [...editorProps.value];
            if (editorProps.field === 'intent_to_bid' && val === 'No') {
                upd[editorProps.rowIndex]['new_contract_price'] = upd[editorProps.rowIndex]['list_price'];
                // Prevents rebate from being captured if 'No' Intent to Bid, highest possible price i.e. Chemist List Price is used
                upd[editorProps.rowIndex]['product_rebate'] = 'No';
                upd[editorProps.rowIndex]['rebate_type'] = null;
                upd[editorProps.rowIndex]['rebate_value'] = null;
                upd[editorProps.rowIndex]['rebate_percentage'] = null  ;
            }
            upd[editorProps.rowIndex][editorProps.field] = val;
            setMainData(upd);
            setValue(upd);
            dispatch(updateKPIStateToDispatchData(upd));
            dispatch(changeStateToDispatchData(upd[editorProps.rowIndex]));
            dispatch(SetAllListUpdate(upd[editorProps.rowIndex]));

            //update dropdown values for global Intent to Bid filter
            if (editorProps.field === "intent_to_bid"){
                let uniqueIntentValues = Array.from(new Set(upd.map(({ intent_to_bid }) => intent_to_bid)));
                sessionStorage.setItem("intentToBidValues",JSON.stringify(uniqueIntentValues));
                props.intentToBidUpdater(prevValue => prevValue + 1);
            }
        }

        else if (editorProps.field === 'new_contract_price') {
            let upd = [...editorProps.value];
            let newContractValue;
            if (isNaN(parseFloat(val)) === true && upd[editorProps.rowIndex]['list_price'] !== null){
                // If 'New' Bid Price is not defined, 'Net' Bid Price (after rebates) is set to 'Chemist List Price (CLP)', by default
                newContractValue = upd[editorProps.rowIndex]['list_price'];
            } else {
                upd[editorProps.rowIndex][editorProps.field] = parseFloat(val.replaceAll(",", "")) || null;
                newContractValue = parseFloat(val.replaceAll(",", "")) || null;
            }
            upd[editorProps.rowIndex]['net_contract_price'] = newContractValue === null|| newContractValue === 0 ? 0: parseFloat((newContractValue - (upd[editorProps.rowIndex]['rebate_value'])).toFixed(2));
            upd[editorProps.rowIndex]['total_revenue'] = parseFloat((upd[editorProps.rowIndex]['net_contract_price'] * upd[editorProps.rowIndex]['annual_usage_volume']).toFixed(2));
            upd[editorProps.rowIndex]['margin_msp'] = upd[editorProps.rowIndex]['net_contract_price'] === 0 || upd[editorProps.rowIndex]['msp'] === null ? null : parseFloat((((upd[editorProps.rowIndex]['net_contract_price'] - upd[editorProps.rowIndex]['msp']) / upd[editorProps.rowIndex]['net_contract_price']) * 100).toFixed(2));
            upd[editorProps.rowIndex]['total_margin'] = upd[editorProps.rowIndex]['net_contract_price'] === 0 || upd[editorProps.rowIndex]['msp'] === null ? null : parseFloat(((upd[editorProps.rowIndex]['net_contract_price'] - upd[editorProps.rowIndex]['msp']) * upd[editorProps.rowIndex]['annual_usage_volume']).toFixed(2));
            upd[editorProps.rowIndex]['discount_to_clp'] = upd[editorProps.rowIndex]['net_contract_price'] === 0 || upd[editorProps.rowIndex]['list_price'] === null || upd[editorProps.rowIndex]['list_price'] === 0 ? null : parseFloat(((1 - (upd[editorProps.rowIndex]['net_contract_price'] / upd[editorProps.rowIndex]['list_price'])) * 100).toFixed(2));
            upd[editorProps.rowIndex]['fts_risk'] = upd[editorProps.rowIndex]['discount_to_clp'] > 40 ? "Yes" : "No";
            upd[editorProps.rowIndex]['bid_kam'] = upd[editorProps.rowIndex]['net_contract_price'] >= upd[editorProps.rowIndex]['kams_floor_price'] ? "Yes" : "No";

            if ( upd[editorProps.rowIndex]['net_contract_price'] !== null && upd[editorProps.rowIndex]['cost_gmx_current_year'] !== null && upd[editorProps.rowIndex]['net_contract_price'] < upd[editorProps.rowIndex]['cost_gmx_current_year']) {
                upd[editorProps.rowIndex]['ncp_cogs'] = "Red";
            }
            else if (upd[editorProps.rowIndex]['net_contract_price'] === null || upd[editorProps.rowIndex]['net_contract_price'] ===0){
                upd[editorProps.rowIndex]['ncp_cogs'] = "Net Bid Price not defined";
            }
            else if (upd[editorProps.rowIndex]['cost_gmx_current_year'] ===null ){
                upd[editorProps.rowIndex]['ncp_cogs'] = "CoGS Not Found";
            }
            else if (upd[editorProps.rowIndex]['msp'] === null){
                upd[editorProps.rowIndex]['ncp_cogs'] = "MSP Not Found";
            }
            else if (upd[editorProps.rowIndex]['net_contract_price'] >= upd[editorProps.rowIndex]['cost_gmx_current_year'] && upd[editorProps.rowIndex]['net_contract_price'] < upd[editorProps.rowIndex]['msp']) {
                upd[editorProps.rowIndex]['ncp_cogs'] = "Yellow";
            }
            else if (upd[editorProps.rowIndex]['net_contract_price'] >= upd[editorProps.rowIndex]['msp'] && upd[editorProps.rowIndex]['net_contract_price'] > upd[editorProps.rowIndex]['cost_gmx_current_year']) {
                upd[editorProps.rowIndex]['ncp_cogs'] = "Green";
            }

            setMainData(upd);
            setValue(upd);
            dispatch(updateKPIStateToDispatchData(upd));
            dispatch(changeStateToDispatchData(upd[editorProps.rowIndex]));
            dispatch(SetAllListUpdate(upd[editorProps.rowIndex]));
        }
    }

    const inputTextEditor = (props) => {
        //returns the type of editor based on column type - input field or dropdown
        if (props.field === "product_rebate" && props.rowData['intent_to_bid'] === 'Yes') {
            return <Dropdown value={props.rowData['product_rebate']} options={statuses} optionLabel="label"
                optionValue="value" onChange={(e) => onEditorComplete(props, e.value)}
                style={{ width: '100%' }}
                itemTemplate={(option) => {
                    return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
                }} />
        }
        else if ((props.field === "rebate_type" && props.rowData['product_rebate'] === 'Yes') && props.rowData['intent_to_bid'] === 'Yes') {
            return <Dropdown value={props.rowData['rebate_type']} options={rebateType} optionLabel="label" optionValue="value"
                onChange={(e) => onEditorComplete(props, e.value)} style={{ width: '100%' }}
                itemTemplate={(option) => {
                    return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
                }} />
        }
        else if (props.field === 'new_contract_price' && props.rowData['intent_to_bid'] === 'Yes') {
            return <InputNumber id={'bid_id'} className="p-inputtext-sm p-d-block p-mb-2" type="text"
                mode='decimal' minFractionDigits={2} maxFractionDigits={2} value={props.rowData[props.field]}
                min={0}
                max={props.rowData['list_price'] || 0}
                onBlur={(e) => onEditorComplete(props, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { onEditorComplete(props, e.target.value) } }}
                onValueChange={(e) => onEditorValueChange(props, e.value)} />
        }
        else if (props.field === "rebate_value" && props.rowData['rebate_type'] === 'Flat Value'
            && props.rowData['product_rebate'] === 'Yes' && props.rowData['intent_to_bid'] === 'Yes') {
            return <InputNumber className="p-inputtext-sm p-d-block p-mb-2" type="text" mode='decimal'
                minFractionDigits={2} value={props.rowData[props.field]}
                min={0} max={props.rowData['new_contract_price'] === null ? props.rowData['list_price'] : props.rowData['new_contract_price']}
                onBlur={(e) => { onEditorComplete(props, e.target.value) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { onEditorComplete(props, e.target.value) } }}
                onValueChange={(e) => onEditorValueChange(props, e.value)} />
        }
        else if (props.field === "rebate_percentage" && props.rowData['rebate_type'] === 'Flat Percentage'
            && props.rowData['product_rebate'] === 'Yes' &&
            props.rowData['intent_to_bid'] === 'Yes') {
            return <InputNumber className="p-inputtext-sm p-d-block p-mb-2" type="text" mode='decimal'
                minFractionDigits={2} maxFractionDigits={2} value={props.rowData[props.field]}
                min={0} max={100}
                onBlur={(e) => onEditorComplete(props, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { onEditorComplete(props, e.target.value) } }}
                onValueChange={(e) => onEditorValueChange(props, e.value)}
            />
        }
        else if (props.field === "rebate_value" && (props.rowData['rebate_type'] === 'Flat Percentage'
            || props.rowData['rebate_type'] === 'Flat Value') &&
            (props.rowData['product_rebate'] === 'Yes' || props.rowData['product_rebate'] === 'No')
            && (props.rowData['intent_to_bid'] === 'Yes')) {
            return <span>{props.rowData['rebate_value']}</span>
        }
        else if (props.field === "rebate_value" && (props.rowData['rebate_type'] === 'Flat Percentage'
            || props.rowData['rebate_type'] === 'Flat Value') &&
            (props.rowData['product_rebate'] === 'Yes' || props.rowData['product_rebate'] === 'No')
            && (props.rowData['intent_to_bid'] === null || props.rowData['intent_to_bid'] === 'No')) {

            return <span>{props.rowData['rebate_value']}</span>
        }
        else if (props.field === "rebate_percentage" && (props.rowData['rebate_type'] === 'Flat Value' || props.rowData['rebate_type'] === 'Flat Percentage') &&
            (props.rowData['product_rebate'] === 'Yes' || props.rowData['product_rebate'] === 'No') &&
            (props.rowData['intent_to_bid'] === 'Yes')) {

            return <span >{props.rowData['rebate_percentage']}</span>
        }
        else if (props.field === "rebate_percentage" && (props.rowData['rebate_type'] === 'Flat Value' || props.rowData['rebate_type'] === 'Flat Percentage') &&
            (props.rowData['intent_to_bid'] === null || props.rowData['intent_to_bid'] === 'No')) {

            return <span >{props.rowData['rebate_percentage']}</span>
        }
        else if (props.field === "product_rebate" &&
            (props.rowData['intent_to_bid'] === null || props.rowData['intent_to_bid'] === 'No')) {
            return <span >{props.rowData['product_rebate']}</span>
        }
        else if (props.field === "new_contract_price" &&
            (props.rowData['intent_to_bid'] === null || props.rowData['intent_to_bid'] === 'No')) {
            return <span >{props.rowData['new_contract_price']}</span>
        }
        else if (props.field === "rebate_type" && props.rowData['product_rebate'] === 'No' &&
            (props.rowData['intent_to_bid'] === 'Yes')) {
            return <span >{props.rowData['rebate_type']}</span>
        }
        else if (props.field === "rebate_type" && props.rowData['product_rebate'] === 'No' &&
            (props.rowData['intent_to_bid'] === null || props.rowData['intent_to_bid'] === 'No')) {
            return <span >{props.rowData['rebate_type']}</span>
        }
        else if (props.field === "line_status") {
            return <Dropdown value={props.rowData['line_status']} options={lineData} optionLabel="label" optionValue="value"
                onChange={(e) => onEditorComplete(props, e.value)} style={{ width: '100%' }} placeholder="Select a Status"
                itemTemplate={(option) => {
                    return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
                }} />
        }
        else if (props.field === "intent_to_bid") {
            return <Dropdown value={props.rowData['intent_to_bid']} options={statuses} optionLabel="label" optionValue="value"
                onChange={(e) => onEditorComplete(props, e.value)} style={{ width: '100%' }} placeholder="Select a Status"
                itemTemplate={(option) => {
                    return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
                }} />
        }
        else if (props.field === "bid_category") {
            return <Dropdown value={props.rowData['bid_category']} options={bidCategory} optionLabel="label" optionValue="value"
                onChange={(e) => onEditorComplete(props, e.value)}

                style={{ width: '100%' }} placeholder="Select a Status"
                itemTemplate={(option) => {
                    return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
                }} />
        }
        else if (props.field === "comments") {
            return <Dropdown value={props.rowData['comments']} options={commentOptions} optionLabel="label" optionValue="value"
                onChange={(e) => onEditorComplete(props, e.value)} style={{ width: '100%' }} placeholder="Select a Comment"
                itemTemplate={(option) => {
                    return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
                }} />
        }
        else if (props.field === "finance_comments" || props.field === "legal_comments") {
            return <InputText className="p-inputtext-sm p-d-block p-mb-2" type="text" value={props.rowData[props.field]}
                onBlur={(e) => onEditorComplete(props, e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { onEditorComplete(props, e.target.value) } }}
                onChange={(e) => onEditorValueChange(props, e.target.value)} />
        }
        else if (props.field === "finance_approved" || props.field === "legal_approved") {
            return <Dropdown value={props.rowData[props.field]} options={statuses} optionLabel="label" optionValue="value"
            onChange={(e) => onEditorComplete(props, e.value)} style={{ width: '100%' }} placeholder="Select a Status"
            itemTemplate={(option) => {
                return <span className={`product-badge status-${option.value.toLowerCase()}`}>{option.label}</span>
            }} />
        }
    }

    const codeEditor = (props) => {
        return inputTextEditor(props);
    }

    const filterColumns = (e) => {
        //filter function to update the selected product details columns
        let selectedColumns = e.value;
        let orderedSelectedColumns = props.type.excel_config.product_details.list.filter(col => selectedColumns.some(sCol => sCol.field === col.field));
        sessionStorage.setItem("selectedProductDetailsColumns",JSON.stringify(orderedSelectedColumns));
        setSelectedColumns(orderedSelectedColumns);
    }

    const filterStatus = <>
        <MultiSelect value={selectedColumns} options={props.type.excel_config.product_details.list}
            maxSelectedLabels={1} optionLabel="header" onChange={filterColumns}
            filter className="filter-dropdown"
        />
    </>;

    let scenarioPlanningHeaderGroup = <ColumnGroup>
        <Row >
            <Column style={{ textAlign: 'center' }} headerClassName="product-detail-header"
                header="Product Details" colSpan={selectedColumns.length + 1}
                filter filterElement={filterStatus}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="current-bid-header"
                header="Bid Details" colSpan={props.type.excel_config.current_bid_details.length}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="user-input-header"
                header="User Inputs" colSpan={props.type.excel_config.user_input.length} />
            <Column style={{ textAlign: 'center' }} headerClassName="calculated-field-header"
                header="Calculated Fields" colSpan={props.type.excel_config.calculated_fields.length}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="comment-header"
                header="User Comments" colSpan={props.type.excel_config.user_comments.length}
            />

        </Row>
        <Row>
            <Column selectionMode='multiple' headerClassName="product-detail-header"
                headerStyle={{ width: '1.8em', textAlign: 'center' }}></Column>
            {columnProductDetailList}
            {columnCurrentBidDetailList}
            {columnUserInputDetailList}
            {columnCalculatedDetailList}
            {columnUserCommentDetailList}
        </Row>
    </ColumnGroup>;

    let financeReviewHeaderGroup = <ColumnGroup>
        <Row >
            <Column style={{ textAlign: 'center' }} headerClassName="current-bid-header"
                    header="Finance Inputs" colSpan={props.type.excel_config.finance_input.length + 1} />
            <Column style={{ textAlign: 'center' }} headerClassName="product-detail-header"
            header="Product Details" colSpan={selectedColumns.length }
            filter filterElement={filterStatus}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="current-bid-header"
                header="Bid Details" colSpan={props.type.excel_config.current_bid_details.length}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="user-input-header"
                header="User Inputs" colSpan={props.type.excel_config.user_input.length} />
            <Column style={{ textAlign: 'center' }} headerClassName="calculated-field-header"
                header="Calculated Fields" colSpan={props.type.excel_config.calculated_fields.length}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="comment-header"
                header="User Comments" colSpan={props.type.excel_config.user_comments.length}
            />
        </Row>
        <Row>
            <Column selectionMode='multiple' headerClassName="current-bid-header"
                headerStyle={{ width: '1.8em', textAlign: 'center' }}></Column>
            {columnFinanceInputDetailList}
            {columnProductDetailList}
            {columnCurrentBidDetailList}
            {columnUserInputDetailList}
            {columnCalculatedDetailList}
            {columnUserCommentDetailList}
        </Row>
    </ColumnGroup>;

    let legalTemplateHeaderGroup = <ColumnGroup>
        <Row >
            <Column style={{ textAlign: 'center' }} headerClassName="current-bid-header"
                    header="Legal Inputs" colSpan={props.type.excel_config.legal_input.length + 1}
                />
            <Column style={{ textAlign: 'center' }} headerClassName="product-detail-header"
                header="Product Details" colSpan={selectedColumns.length}
                filter filterElement={filterStatus}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="current-bid-header"
                header="Financial Overview" colSpan={props.type.excel_config.financial_overview.length}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="comment-header"
                header="Financials" colSpan={props.type.excel_config.financials.length}
            />
        </Row>
        <Row>
            <Column selectionMode='multiple' headerClassName="current-bid-header"
                headerStyle={{ width: '1.8em', textAlign: 'center' }}></Column>
            {columnLegalInputDetailList}
            {columnProductDetailList}
            {columnFinancialOverviewDetailList}
            {columnFinancialsDetailList}
        </Row>
    </ColumnGroup>;


    let pnLHeaderGroup = <ColumnGroup>
        <Row >
            <Column style={{ textAlign: 'center' }} headerClassName="product-detail-header"
                header="Product Details" colSpan={props.type.excel_config.product_details.selected_list.length}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="current-bid-header"
                header="Bid Details" colSpan={props.type.excel_config.current_bid_details.length}
            />
            <Column style={{ textAlign: 'center' }} headerClassName="comment-header"
                header="Price Volume Movement" colSpan={props.type.excel_config.pvm.length}
            />
        </Row>
        <Row>
            {

                tab_name === "Finance Review" || tab_name === "P&L Review" ? null : (
                    <Column selectionMode='multiple' headerClassName="product-detail-header"
                        headerStyle={{ width: '1.8em', textAlign: 'center' }}></Column>
                )

            }
            {columnProductDetailList}
            {columnCurrentBidDetailList}
            {columnPVMList}
        </Row>
    </ColumnGroup>;

    const colRowStyle = (data) => {
        return {
            'npc': true
        }
    }

    const clearCustomFilter = () => {
        //function to clear all applied filters.
        dispatch(resetFlag(false));
        setValue(mainData);
        filterSelectionList = [];
        props.handleFilterProductCalculation(KPICalculation(stateObj.UserRecord.userRecord));
        sessionStorage.removeItem("filterGlobal");
        sessionStorage.removeItem("filter");
    }

    const cellStyleRow = (rowData, options) => {
        //return the styles for cells of different columns
        if (tab_name === "P&L Review"){
            if (options.rowData['difference'] < 0 && options.field === 'difference') {
                    return {
                        'error-show': true
                    }
            }
            if (options.rowData['pvm_due_to_price'] < 0 && options.field === 'pvm_due_to_price') {
                    return {
                        'error-show': true
                    }
            }
            if (options.rowData['pvm_due_to_qty'] < 0 && options.field === 'pvm_due_to_qty') {
                    return {
                        'error-show': true
                    }
                }
            }
        
        
        if (options.rowData['net_contract_price'] <= 0) {
            if (options.field === 'net_contract_price' || 
                options.field === 'total_revenue' ||
                options.field === 'total_margin'|| 
                options.field === 'margin_msp' ||
                options.field === 'discount_to_clp') {
                return {
                    'error-show': true
                }
            }
            else if (options.field === 'fts_risk') {
                return {
                    'error-show-dropdown': true
                }
            }
        }

        if (options.rowData['list_price'] === null || options.rowData['list_price'] === 0) {
            if (options.field === 'discount_to_clp') {
                return {
                    'error-show': true
                }
            }
            else if (options.field === 'fts_risk') {
                return {
                    'error-show-dropdown': true
                }
            }
        }

        if (options.rowData['msp'] === null || options.rowData['msp'] === 0) {
            if (options.field === 'margin_msp' || options.field === 'total_cost_msp' || options.field === 'total_margin') {
                return {
                    'error-show': true
                }
            }
        }

        if (options.rowData['annual_usage_volume'] === null || options.rowData['annual_usage_volume'] === 0) {
            if (options.field === 'annual_usage_volume' || options.field === 'total_revenue' || options.field === 'total_margin') {
                return {
                    'error-show': true
                }
            }
        }

        if (options.field === 'supply_status' || options.field === 'shortage') {
            if (rowData === 'Yes') {
                return {
                    'ngccongs-yellow': true
                }
            }
            else if (rowData === 'No') {
                return {
                    'ngccongs-green': true
                }
            }

        }

        if (typeof (rowData) === 'string') {

            if (rowData === 'Yellow') {
                return {
                    'ngccongs-yellow': true
                }
            }
            else if (rowData === 'Green') {
                return {
                    'ngccongs-green': true
                }
            }
            else if (rowData === 'Red') {
                return {
                    'ngccongs-red': true
                }
            }
            else if (rowData === 'Net Bid Price not defined' || rowData === 'CoGS Not Found' || rowData === 'MSP Not Found'){
                return {
                    'ngccongs-grey': true
                }
            }
            else if (rowData === 'Yes' || rowData === 'No') {
                return {
                    'center-text-align': true
                }
            }
            else {
                return {
                    'left-text-align': true
                }
            }
        }
        if (typeof (rowData) === 'number') {
            return {
                'right-text-align': true
            }
        }
    }

    const onSelectedResetValue = (val) => {
        setSelectedValue(val); //update selected rows which can be reset
        props.onSelectedResetItem(val);
    }

    const onCustomPage1 = (event) => {
        //store the pagination object in sessionStorage
        setFirst1(event.first);
        setRows2(event.rows);
        setCurrentPage(event.page + 1);
        let storePaginationObj = {
            "first": event.first,
            "rows": event.rows,
            "currentPage": event.page + 1
        }
        sessionStorage.setItem("pagination", JSON.stringify(storePaginationObj))
    }

    const onPageInputKeyDown = (event, options) => {
        //check validation for correct page number input
        if (event.key === 'Enter') {
            const page = parseInt(currentPage);
            if (page < 0 || page > options.totalPages) {
                setPageInputTooltip(`Value must be between 1 and ${options.totalPages}.`);
            }
            else {
                //update page
                const first = currentPage ? options.rows * (page - 1) : 0;
                setFirst1(first);
                let storePaginationObj = {
                    "first": first,
                    "rows": options.rows,
                    "currentPage": parseInt(currentPage)
                }
                sessionStorage.setItem("pagination", JSON.stringify(storePaginationObj))
                setPageInputTooltip('Press \'Enter\' key to go to this page.');
            }
        }
    }

    const onPageInputChange = (event) => {
        setCurrentPage(event.target.value);
    }

    //template for pagination bar display
    const template2 = {
        layout: 'PrevPageLink CurrentPageReport NextPageLink RowsPerPageDropdown',
        'RowsPerPageDropdown': (options) => {
            const dropdownOptions = [
                { label: 10, value: 10 },
                { label: 20, value: 20 },
                { label: 50, value: 50 }
            ];

            return <>
                <span>
                    Product Per Page
                </span>
                <Dropdown value={options.value} options={dropdownOptions}
                    onChange={options.onChange} appendTo={document.body} />
            </>;
        },
        'CurrentPageReport': (options) => {
            return (
                <span className="p-mx-3" style={{ color: 'var(--text-color)', userSelect: 'none' }}>
                    <InputText size="2" style={{ margin: '0px', padding: '4px', textAlign: 'center' }} className="p-ml-1 p-text-center" value={currentPage} tooltip={pageInputTooltip}
                        onKeyDown={(e) => onPageInputKeyDown(e, options)} onChange={onPageInputChange} />
                    <span style={{ paddingLeft: '5px' }}> Of {options.totalPages}</span>
                </span>
            )
        }
    };


    const onSorting = (e) => {
        //updates the table based on selected sort value of the column
        setDefaultSelectionSorting(e);
        let sortArr = [];
        sessionStorage.setItem("sorting", JSON.stringify(e));
        if (e.sortField === null) {
            sortArr = value.sort((a, b) => {
                return a['id_18char__opportunity'].localeCompare(b['id_18char__opportunity']) || a['local_item_code'].localeCompare(b['local_item_code'])
            })
            setValue(sortArr);
        }
        else {
            //string comparison
            if (e.sortField === 'local_product_description' || e.sortField === 'business_unit_name') {
                sortArr = value.sort((a, b) => {
                    if (e.sortOrder === -1) {
                        return b[e.sortField].localeCompare(a[e.sortField])
                    }
                    else {
                        return a[e.sortField].localeCompare(b[e.sortField])
                    }
                });
                setValue(sortArr);
            }
            else {
                //numerical comparison
                sortArr = value.sort((a, b) => {
                    if (e.sortOrder === -1) {
                        return b[e.sortField] - a[e.sortField]
                    }
                    else {
                        return a[e.sortField] - b[e.sortField]
                    }
                });
                setValue(sortArr);
            }
        }
    }

    return (
        <div>
            <div className="viewtable">
                <div className="card">
                    <DataTable ref={dt} value={value} rowClassName={colRowStyle}
                        exportFilename="gtcs report" scrollable style={{ width: '100%' }}
                        resizableColumns columnResizeMode="expand"
                        editMode="cell" selectOnEdit='false'
                        paginator paginatorTemplate={template2}
                        first={first1} rows={rows2}
                        onPage={onCustomPage1}
                        removableSort
                        sortField={defaultSelectionSorting.sortField}
                        sortOrder={defaultSelectionSorting.sortOrder}
                        onSort={(e) => { onSorting(e) }}
                        className="p-datatable-sm editable-cells-table" scrollHeight="65vh" showGridlines 
                        headerColumnGroup={props.type.tab_name === "Scenario Planning" ? scenarioPlanningHeaderGroup : 
                            props.type.tab_name === "Finance Review" ? financeReviewHeaderGroup : 
                            props.type.tab_name === "Legal Template" ? legalTemplateHeaderGroup : 
                            props.type.tab_name === "P&L Review" ? pnLHeaderGroup : null}
                        cellClassName={cellStyleRow}
                        loading={isloading}
                        selectionMode='checkbox'
                        selection={selectedValue} onSelectionChange={e => onSelectedResetValue(e.value)}
                    >
                        {

                            tab_name === "P&L Review" ? null : (<Column selectionMode='multiple' headerClassName="user-input-header" headerStyle={{ width: '1.8em', textAlign: 'center' }}>

                            </Column>)

                        }
                        {columnLegalInputDetailList}
                        {columnFinanceInputDetailList}
                        {columnProductDetailList}
                        {columnCurrentBidDetailList}
                        {columnUserInputDetailList}
                        {columnCalculatedDetailList}
                        {columnUserCommentDetailList}
                        {columnFinancialOverviewDetailList}
                        {columnFinancialsDetailList}
                        {columnPVMList}
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

export default ViewDataTable;
