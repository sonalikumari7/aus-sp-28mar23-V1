import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import { useRef, useState, useEffect } from "react";
import { filteringColumnSelectionGlobal, getPnLData } from "../../utility/util";
import "./index.css";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tab, Tabs } from '@material-ui/core'
import TabConfigJson from '../../assets/json/config.json';

export default function PnLAnalysis(props){

    const [summaryTableData, setSummaryTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const dt = useRef(null);

    useEffect(()=>{
        setLoading(false);
        let filterData = getPnLData(filteringColumnSelectionGlobal(props.mainData, props.filterSelectionList));
        let filterPnLData = getPnLData(filterData);
        setSummaryTableData([...filterPnLData]);
    },[]);

    useEffect(()=>{
        let tempFilterList = props.filterSelectionList;
        if (JSON.stringify(tempFilterList) === '{}'){
            sessionStorage.removeItem("filterGlobal");
            sessionStorage.removeItem("filter");
            tempFilterList = [];
        }
        let tempData = filteringColumnSelectionGlobal(props.mainData, tempFilterList);
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

    return (
        <div style={{padding:"1rem"}}>

            <div className="card bu-level-results" style={{width:"60%"}}>
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
        </div>
    )
}