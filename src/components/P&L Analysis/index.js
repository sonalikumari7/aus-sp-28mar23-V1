import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import { useRef, useState, useEffect } from "react";
import { filteringColumnSelectionGlobal, getPnLData } from "../../utility/util";
import "./index.css";
import { Tooltip } from "antd";
import TabConfigJson from '../../assets/json/config.json';
import { CSVLink } from "react-csv";
import { Modal } from "antd";
import ReactExport from 'react-data-export';

export default function PnLAnalysis(props){

    const [summaryTableData, setSummaryTableData] = useState([]); //state to store the data for summary table
    const [mainData, setMainData] = useState([]); //state which stores the original data
    const [loading, setLoading] = useState(true);
    const [pnlTableHeaders, setPnlTableHeaders] = useState([]); //state to store the headers for csv export of main data table
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dt = useRef(null);

    const summaryTableHeader = [
        {label:"A$", key:"a"},
        {label:"Award Value", key:"award_value"},
        {label:"Prior Actual Value", key:"prior_actual_value"},
        {label:"Variance $", key:"variance_price"},
        {label:"Variance %", key:"variance_percent"},
        {label:"PVM Due to Price", key:"pvm_price"},
        {label:"PVM Due to Volume", key:"pvm_volume"},
    ]; //stores the headers for csv export of summary table

    useEffect(()=>{
        //update the summary table data on initial render and populate the calculation fields like probable volume
        setLoading(false);
        let filterData = getPnLData(filteringColumnSelectionGlobal(props.mainData, props.filterSelectionList));
        let filterPnLData = getPnLData(filterData);
        setSummaryTableData([...filterPnLData]);
        props.mainData.forEach(p => {
            // Setting default Net Bid Price (after rebates) to List Price (also called Chemist List Price or CLP)
            // If a 'New' Bid Price is entered in User Input field, provided the 'new' value is not blank AND is different from default value List Price it is 'set'
            let contractPrice;
            if (p['list_price'] !== p['new_contract_price'] && p['new_contract_price'] !== null) {
                contractPrice = p['new_contract_price'];
            } else if(p['list_price'] !== null){
                contractPrice = p['list_price'];
            } else contractPrice = 0;

            p['net_contract_price'] = contractPrice === 0 ? 0: parseFloat((contractPrice - p['rebate_value']).toFixed(2));
            p['margin_msp'] = p['net_contract_price'] === 0 || p['msp'] === null ? null: parseFloat((((p['net_contract_price'] - p['msp']) / p['net_contract_price']) * 100).toFixed(2));
            p['total_revenue'] = parseFloat(( p['net_contract_price'] * p['annual_usage_volume']).toFixed(2));
            p['gross_revenue_percent'] = parseFloat((((p['total_revenue'] - p['total_cost_msp']) * 100)/p['total_revenue']).toFixed(2));
            p['gross_revenue_percent'] = isFinite(p['gross_revenue_percent']) ? p['gross_revenue_percent'] : 0;

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
            p['difference'] = parseFloat((p['probable_revenue'] - p['prior_actual_revenue']).toFixed(2));
            p['pvm_due_to_qty'] = parseFloat(((p['probable_volume'] - p['prior_actual_qty']) * p['prior_asp']).toFixed(2));
            p['pvm_due_to_price'] = parseFloat(((p['net_contract_price'] -  p['prior_asp']) * p['probable_volume']).toFixed(2));
        });
        setMainData([...props.mainData]);
    },[]);

    useEffect(()=>{
        //updated summary table data on every filter change
        let tempFilterList = props.filterSelectionList;
        if (JSON.stringify(tempFilterList) === '{}'){
            sessionStorage.removeItem("filterGlobal");
            sessionStorage.removeItem("filter");
            tempFilterList = [];
        }
        let tempData = filteringColumnSelectionGlobal(props.mainData, tempFilterList);
        setMainData([...tempData]);
        let tempPnLData = getPnLData(tempData);
        setSummaryTableData([...tempPnLData]);
    },[JSON.stringify(props.filterSelectionList)]);

    const cellStyleRow = (rowData, options) => {
        //return the styles for cells of different columns
        if (rowData < 0) {
            return {
                'error-show-pnl': true
            }
        }
    }

    const colRowStyle = (data) => {
        return {
            'npc': true
        }
    }

    function numberFormatter(cellValue,type) {
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
        else if (type === "revenue"){
            result = formatter.format(cellValue);
            if (isNegative){
                result = "-$" + result.slice(1);
            }
            else result = '$' + result;
        }
        else if (type === "currency"){
            result = cellValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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

    function numberFormatterExport(cellValue,type) {
        //for the excel exports only
        // returns formatted string of number based on its type- currency, quantity, percent or negative
        if (cellValue === null || cellValue === undefined || cellValue === "")
            return cellValue;

        let result = "";
        let isNegative = cellValue < 0 ? true : false;

        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        if (type === undefined){
            return cellValue;
        }
        else if (type === "revenue"){
            result = formatter.format(cellValue);
        }
        else if (type === "currency"){
            result = cellValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
        else if (type === "quantity"){
            result = Math.round(cellValue).toLocaleString('en-US');
        }
        else if (type === "percent"){
            result = String(cellValue)+"%";
        }
        return result;
    }

    const headerGroup = <ColumnGroup>
        <Row>
            <Column style={{ textAlign: 'center' }} headerClassName="dark-header"
                header="A$" colSpan={1} />
            <Column style={{ textAlign: 'center' }} headerClassName="light-header"
                header="Award Value" colSpan={1} />
            <Column style={{ textAlign: 'center' }} headerClassName="dark-header"
                header="Prior Actual Value" colSpan={1} />
            <Column style={{ textAlign: 'center' }} headerClassName="light-header"
                header="Variance" colSpan={2} />
            <Column style={{ textAlign: 'center' }} headerClassName="dark-header"
                header="Price Volume Movement" colSpan={2} />
        </Row>
        <Row>
            <Column style={{ textAlign: 'center' }} header="" field="" headerClassName="dark-header"/>
            <Column style={{ textAlign: 'center' }} header="" field="" headerClassName="light-header"/>
            <Column style={{ textAlign: 'center' }} header="" field="" headerClassName="dark-header"/>
            <Column style={{ textAlign: 'center' }} header="$" field="variance_price" headerClassName="light-header"/>
            <Column style={{ textAlign: 'center' }} header="%" field="variance_volume" headerClassName="light-header"/>
            <Column style={{ textAlign: 'center' }} header="Price" field="pvm_price" headerClassName="dark-header"/>
            <Column style={{ textAlign: 'center' }} header="Volume" field="pvm_volume" headerClassName="dark-header"/>
        </Row>
    </ColumnGroup>;

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    function getPnlTableData(){
        //function to be called on clicking download button in the modal
        //updates the headers for csv export for the table
        let columns;
        TabConfigJson['Tabs'].map((t, i) => {
            if (t.tab_name === "P&L Review")
                columns = t.excel_config;
        });
        let headers = [];
        
        for (let i in columns){
            columns[i].map((item) => {
                headers.push({
                    label: item.header,
                    key: item.field
                })
            });
        }
        setPnlTableHeaders([...headers])
    }

    function ExportPnlSummary(){
        //function component to export the summary table data in a formatted excel file format. We need to convert our data to the format accepted by this library like the multiDataSet.
        //by default this function is called every time the page is re-rendered (since this component gets re rendered every time a state changes in viewTabs)
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const multiDataSet = [  
            {
                columns: [
                    {title: "A$"},
                    {title: "Award Value"},
                    {title: "Prior Value"},
                    {title: "Variance $"},
                    {title: "Variance %"},
                    {title: "PVM Due to Price"}, 
                    {title: "PVM Due to Volume"}
                ],
                data: []
            }
        ];
        let keys = [
            {key:"a"},
            {key:"award_value", type:"revenue"},
            {key:"prior_actual_value", type:"revenue"},
            {key:"variance_price", type:"revenue"},
            {key:"variance_percent", type:"percent"},
            {key:"pvm_price", type:"revenue"},
            {key:"pvm_volume", type:"revenue"},
        ];
        summaryTableData.map((row)=>{
            let tempRow = [];
            keys.map((obj) => {
                let type = '';
                if (row.a === 'GM%' && obj.key !== 'a')
                    type = "percent";
                else type = obj.type;
                let formattedValue = numberFormatterExport(row[obj.key],type);
                tempRow.push({
                    value:formattedValue,
                    style:{
                        font:{
                            color:{
                                rgb: row[obj.key] < 0 ? "FFFF0000":"00000000"
                            }
                        }
                    }
                });
            });
            multiDataSet[0]["data"].push(tempRow);
        });
        
        return (
            <ExcelFile filename = "P&L Summary" element={<div className="download-summary">
                <i className="pi pi-download" style={{ marginRight: '0.2rem', fontSize:"0.9rem" }} /> Download Summary
            </div>}>
                <ExcelSheet dataSet={multiDataSet} name="Summary"/>
            </ExcelFile>
        )
    }

    function ExportDataTable(){
        //functional component for data table export.
        const ExcelFile = ReactExport.ExcelFile;
        const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
        const multiDataSet = [  
            {
                columns: [],
                data: []
            }
        ];
        let keys = [];
        TabConfigJson['Tabs'].map((t) => {
            if (t.tab_name === "P&L Review"){
                t.excel_config.product_details.map((col) => {
                    multiDataSet[0]["columns"].push({
                        title:col.header
                    });
                    keys.push({
                        key:col.field,
                        type:col.type
                    });
                });
                t.excel_config.current_bid_details.map((col) => {
                    multiDataSet[0]["columns"].push({
                        title:col.header
                    });
                    keys.push({
                        key:col.field,
                        type:col.type
                    });
                });
                t.excel_config.pvm.map((col) => {
                    multiDataSet[0]["columns"].push({
                        title:col.header
                    });
                    keys.push({
                        key:col.field,
                        type:col.type
                    });
                });
            }
        });
        mainData.map((row)=>{
            let tempRow = [];
            keys.map((obj) => {
                let formattedValue = numberFormatterExport(row[obj.key],obj.type);
                tempRow.push({
                    value:formattedValue || '',
                    style:{
                        font:{
                            color:{
                                rgb: row[obj.key] < 0 ? "FFFF0000":"00000000"
                            }
                        }
                    }
                });
            });
            multiDataSet[0]["data"].push(tempRow);
        });

        return (
            <ExcelFile filename="P&L Calculation Table" element={<div className="download-summary">
                <i className="pi pi-download" style={{ marginRight: '0.2rem', fontSize:"0.9rem" }} /> Download Summary
            </div>}>
                <ExcelSheet dataSet={multiDataSet} name="Revenue Calcuations"/>
            </ExcelFile>
        )
    }

    return (
        <div style={{padding:"1rem"}}>
            <Modal title="Product Level Details"
            open={isModalOpen} onOk={handleOk} 
            onCancel={handleCancel} width={"85%"}
            footer={<div>
                <ExportDataTable />
            </div>} >
                {
                    TabConfigJson['Tabs'].map((t, i) => {
                        if (t.tab_name === "P&L Review")
                            return (
                                <DataTable value={mainData} scrollable scrollHeight="25rem"
                                rowClassName={colRowStyle}
                                style={{ width: '100%' }}
                                className="p-datatable-sm pnl-table"
                                headerColumnGroup={<ColumnGroup>
                                    <Row>
                                        <Column style={{ textAlign: 'center' }} headerClassName="product-detail-header"
                                            header="Product Details" colSpan={t.excel_config.product_details.length}
                                        />
                                        <Column style={{ textAlign: 'center' }} headerClassName="current-bid-header"
                                            header="Bid Details" colSpan={t.excel_config.current_bid_details.length}
                                        />
                                        <Column style={{ textAlign: 'center' }} headerClassName="comment-header"
                                            header="Price Volume Movement" colSpan={t.excel_config.pvm.length}
                                        />
                                    </Row>
                                    <Row>
                                        {t.excel_config.product_details.map((k)=>{
                                            return (
                                                <Column key={k.field} field={k.field}
                                                    headerStyle={{ width: '75px' }}
                                                    headerClassName="header-word-wrap product-detail-header"
                                                    header={<span>{k.header.toUpperCase()}</span>}
                                                    sortable={k.sortable === undefined ? false : true}
                                                    body = {(rowData)=>{
                                                        return numberFormatter(rowData[k.field],k.type)
                                                    }}
                                                />
                                            )
                                        })}
                                        {t.excel_config.current_bid_details.map((k)=>{
                                            return (
                                                <Column key={k.field} field={k.field}
                                                    headerStyle={{ width: '75px' }}
                                                    headerClassName="header-word-wrap current-bid-header"
                                                    header={<span>{k.header.toUpperCase()}</span>}
                                                    sortable={k.sortable === undefined ? false : true}
                                                    body = {(rowData)=>{
                                                        return numberFormatter(rowData[k.field],k.type)
                                                    }}
                                                />
                                            )
                                        })}
                                        {t.excel_config.pvm.map((k)=>{
                                            return (
                                                <Column key={k.field} field={k.field}
                                                    headerStyle={{ width: '75px' }}
                                                    headerClassName="header-word-wrap product-detail-header"
                                                    header={<span>{k.header.toUpperCase()}</span>}
                                                    sortable={k.sortable === undefined ? false : true}
                                                    body = {(rowData)=>{
                                                        return numberFormatter(rowData[k.field],k.type)
                                                    }}
                                                />
                                            )
                                        })}
                                    </Row>
                                </ColumnGroup> }
                                cellClassName={cellStyleRow} >
                                    {t.excel_config.product_details.map((k)=>{
                                        return (
                                            <Column key={k.field} field={k.field}
                                                headerStyle={{ width: '75px' }}
                                                headerClassName="header-word-wrap product-detail-header"
                                                header={<span>{k.header.toUpperCase()}</span>}
                                                sortable={k.sortable === undefined ? false : true}
                                                body = {(rowData)=>{
                                                    return numberFormatter(rowData[k.field],k.type)
                                                }}
                                            />
                                        )
                                    })}
                                    {t.excel_config.current_bid_details.map((k)=>{
                                        return (
                                            <Column key={k.field} field={k.field}
                                                headerStyle={{ width: '75px' }}
                                                headerClassName="header-word-wrap current-bid-header"
                                                header={<span>{k.header.toUpperCase()}</span>}
                                                sortable={k.sortable === undefined ? false : true}
                                                body = {(rowData)=>{
                                                    return numberFormatter(rowData[k.field],k.type)
                                                }}
                                            />
                                        )
                                    })}
                                    {t.excel_config.pvm.map((k)=>{
                                        return (
                                            <Column key={k.field} field={k.field}
                                                headerStyle={{ width: '75px' }}
                                                headerClassName="header-word-wrap product-detail-header"
                                                header={<span>{k.header.toUpperCase()}</span>}
                                                sortable={k.sortable === undefined ? false : true}
                                                body = {(rowData)=>{
                                                    return numberFormatter(rowData[k.field],k.type)
                                                }}
                                            />
                                        )
                                    })}
                                </DataTable>
                            )
                    })
                }
            </Modal>

            <div style={{ display:"flex", justifyContent:"center" }}>
                <div className="card"  style={{width:"70%"}}>
                    <DataTable ref={dt} value={summaryTableData}
                    rowClassName={colRowStyle}
                    style={{ width: '100%' }}
                    className="p-datatable-sm pnl-table"
                    headerColumnGroup={headerGroup}
                    loading={loading}
                    cellClassName={cellStyleRow}>
                        <Column field="a" />
                        <Column field="award_value" body = {(rowData)=>{
                                if (rowData['a'] === "GM%")
                                    return numberFormatter(rowData["award_value"],"percent");
                                return numberFormatter(rowData["award_value"],"revenue");
                            }} />
                        <Column field="prior_actual_value" body = {(rowData)=>{
                                if (rowData['a'] === "GM%")
                                    return numberFormatter(rowData["prior_actual_value"],"percent");
                                return numberFormatter(rowData["prior_actual_value"],"revenue");
                            }} />
                        <Column field="variance_price" body = {(rowData)=>{
                                if (rowData['a'] === "GM%")
                                    return null;
                                return numberFormatter(rowData["variance_price"],"revenue");
                            }} />
                        <Column field="variance_percent" body = {(rowData)=>{
                                if (rowData['a'] === "GM%")
                                    return null;
                                return numberFormatter(rowData["variance_percent"],"percent");
                            }} />
                        <Column field="pvm_price" body = {(rowData)=>{
                                if (rowData['a'] === "GM%")
                                    return null;
                                return numberFormatter(rowData["pvm_price"],"revenue");
                            }} />
                        <Column field="pvm_volume" body = {(rowData)=>{
                                if (rowData['a'] === "GM%")
                                    return null;
                                return numberFormatter(rowData["pvm_volume"],"revenue");
                            }} />
                    </DataTable>
                </div>
                <div className="download-card">
                    <div>
                        <p onClick={showModal} style={{marginTop:"0.4rem", cursor:"pointer", width:"max-content"}}>
                        <i className="pi pi-table" style={{ marginRight: '0.2rem', fontSize:"0.9rem" }} /> View Data Table 
                        </p>
                        <ExportPnlSummary />
                    </div>
                </div>
            </div>
            <div style={{marginTop:"1rem"}}>
                <Tooltip
                title={
                    <>
                    <ul style={{listStyle:"disc", paddingLeft:"0rem"}}>
                        <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>By default, winning probability for <b>"Single Source"</b> products is <b>100%</b>.</li>
                        <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>For products with <b>Gross Margin &gt;= 50%</b>, winning probability is <b>75%</b>.</li>
                        <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>For products with <b>Gross Margin &gt;= 20%</b>, winning probability is <b>50%</b>.</li>
                        <li style={{marginLeft:"1.2rem", marginTop:"0.5rem"}}>For products with <b>Gross Margin &lt; 20%</b>, winning probability is <b>25%</b>.</li>
                    </ul>
                    </>
                }
                overlayInnerStyle={{backgroundColor:"#ececec", width:"40rem", color:"black", fontSize:"0.85rem",opacity:0.95}}
                placement="right"
                color={"#ececec"}
                className="tooltip-instructions"
                >
                    <i className="pi pi-question-circle" style={{ marginRight: '5px', fontSize:"0.9rem" }} />
                    Logic for probability calculations
                </Tooltip>
            </div>
        </div>
    )
}