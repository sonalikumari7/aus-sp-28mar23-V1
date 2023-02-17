import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import { useRef, useState, useEffect } from "react";
import { filteringColumnSelectionGlobal, getPnLData } from "../../utility/util";
import "./index.css";
import { Button } from "antd";
import TabConfigJson from '../../assets/json/config.json';
import { CSVLink } from "react-csv";
import { Modal } from "antd";

export default function PnLAnalysis(props){

    const [summaryTableData, setSummaryTableData] = useState([]);
    const [mainData, setMainData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pnlTableData, setPnlTableData] = useState([]);
    const [pnlTableHeaders, setPnlTableHeaders] = useState([]);
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
    ]

    useEffect(()=>{
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

    return (
        <div style={{padding:"1rem"}}>
            <Modal title="Product Level Details"
            open={isModalOpen} onOk={handleOk} 
            onCancel={handleCancel} width={"85%"}
            footer={<div>
                <CSVLink filename={"P&LData.csv"} data={mainData} headers={pnlTableHeaders} className="download-summary" onClick={getPnlTableData}>
                    <Button>Download <i className="pi pi-download" style={{ marginLeft: '0.5rem', fontSize:"0.9rem" }} /></Button>
                </CSVLink>
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
                                    <Row >
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
                        <CSVLink filename={"Summary.csv"} data={summaryTableData} className="download-summary" headers={summaryTableHeader}>
                        <i className="pi pi-download" style={{ marginRight: '0.2rem', fontSize:"0.9rem" }} /> Download Summary 
                        </CSVLink>
                    </div>
                </div>
            </div>
        </div>
    )
}