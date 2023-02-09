import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import { Row } from "primereact/row";
import { useRef, useState, useEffect } from "react";
import { getPnLData } from "../../utility/util";
import "./index.css"

export default function PnLAnalysis(props){

    const [tableData, setTableData] = useState([]);
    const [loading, SetLoading] = useState(true);
    const dt = useRef(null);

    useEffect(()=>{
        let tempData = getPnLData(props.data);
        setTableData(tempData);
        SetLoading(false);
        console.log(tempData);
    },[])

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
        if (cellValue === 0)
            return null;
        let result = "";
        let isNegative = cellValue < 0 ? true : false;

        if (type === undefined){
            return cellValue;
        }
        else if (type === "currency"){
            result = cellValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            console.log(result)
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
            <div className="card" style={{width:"60%"}}>
                <DataTable ref={dt} value={tableData}
                rowClassName={colRowStyle}
                style={{ width: '100%' }}
                className="p-datatable-sm pnl-table"
                headerColumnGroup={headerGroup}
                loading={loading}
                cellClassName={cellStyleRow}>
                    <Column field="a" />
                    <Column field="award_value" body = {(rowData)=>{
                            return numberFormatter(rowData["award_value"],"revenue")
                        }} />
                    <Column field="prior_actual_value" body = {(rowData)=>{
                            return numberFormatter(rowData["prior_actual_value"],"revenue")
                        }} />
                    <Column field="variance_price" body = {(rowData)=>{
                            return numberFormatter(rowData["variance_price"],"revenue")
                        }} />
                    <Column field="variance_percent" body = {(rowData)=>{
                            return numberFormatter(rowData["variance_percent"],"percent")
                        }} />
                    <Column field="pvm_price" body = {(rowData)=>{
                            return numberFormatter(rowData["pvm_price"],"revenue")
                        }} />
                    <Column field="pvm_volume" body = {(rowData)=>{
                            return numberFormatter(rowData["pvm_volume"],"revenue")
                        }} />
                </DataTable>
            </div>
        </div>
    )
}