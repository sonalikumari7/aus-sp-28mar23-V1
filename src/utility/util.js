// This function returns column filter dropdowns based on input data
export const filterColumnDropDown = (list, keyName) => {
    let resultFilter = [...new Set((list)
        .map(r => r[keyName]))]
        .map(p => {
            if (p === null) {
                // if column value is null then add Blank lable for that value so in UI its show Blank label instead show nothing
                return { "field": 'Blank', "header": 'Blank', "keyName": 'market_status' };
            }
            return { "field": p, "header": p, "keyName": keyName };
        });
    return resultFilter;
}

// This function filters data based on input selection list of applied filter using session item "filter"
export const filteringColumnSelection = (data, filtercolumnlist) => {
    let expression = sessionStorage.getItem("filterGlobal") || ""; // check if any global filters are applied or not
    if (expression && expression.length !== 0){
        expression += " && ";
    }
    let filterList = [];
    for (let i in filtercolumnlist) {
        //for each filter, evaluate an expression and append it
        expression += "(";
        filtercolumnlist[i].forEach((r, index) => {
            expression += "item['" + i + "'] === '" + r["field"] + "'" +
                (index === filtercolumnlist[i].length - 1 ? "" : " || ");
        });
        expression += ") && ";
    }
    expression = expression.replaceAll("() &&", "").replaceAll("'Blank'", null).trim();

    if (expression.endsWith("||") || expression.endsWith("&&")) {
        expression = expression.substring(0, expression.length - 2);
    }

    if (expression.length === 0) {
        const tempExpression = sessionStorage.getItem("filter");
        //chcek for already applied filters
        if (tempExpression === null) {
            filterList = data;
            return filterList;
        }
        else {
            filterList = data.filter(item => eval(tempExpression));
            return filterList;
        }
    }
    else {
        sessionStorage.setItem("filter", expression);
        filterList = data.filter(item => eval(expression));
        return filterList;
    }
}

// This function filters data based on input selection list of global filters using session item "filterGlobal"
export const filteringColumnSelectionGlobal = (data, filtercolumnlist) => {
    let expression = "";
    let filterList = [];
    for (let i in filtercolumnlist) {
        expression += "(";
        filtercolumnlist[i].forEach((r, index) => {
            expression += "item['" + i + "'] === '" + r["field"] + "'" +
                (index === filtercolumnlist[i].length - 1 ? "" : " || ");
        });
        expression += ") && ";
    }
    expression = expression.replaceAll("() &&", "").replaceAll("'Blank'", null).trim();

    if (expression.endsWith("||") || expression.endsWith("&&")) {
        expression = expression.substring(0, expression.length - 2);
    }

    if (expression.length === 0) {
        const tempExpression = sessionStorage.getItem("filterGlobal");
        if (tempExpression === null) {
            filterList = data;
            return filterList;
        }
        else {
            filterList = data.filter(item => eval(tempExpression));
            return filterList;
        }
    }
    else {
        sessionStorage.setItem("filterGlobal", expression);
        filterList = data.filter(item => eval(expression));
        return filterList;
    }
}

/* 
 This function is calculate Total Revenue, Total Margin, Overall Percentage and Discount for the Product details KPIs. 
 This is KPI result function
*/

export const KPICalculation = (list) => {
    let total_revenue_count = 0;
    let total_margin_count = 0;
    let discount1 = 0
    let discount2 = 0
    list.forEach(p => {
        let contractPrice;
        if (p['list_price'] !== p['new_contract_price'] && p['new_contract_price'] !== null) {
            contractPrice = p['new_contract_price']
        } else {
            contractPrice = p['list_price']
        }
        p['net_contract_price'] = parseFloat((contractPrice - p['rebate_value']).toFixed(2))
        total_revenue_count += parseInt((p['net_contract_price'] * p['annual_usage_volume']))
        total_margin_count += parseFloat( p['net_contract_price'] === null || p['msp'] === null || p['annual_usage_volume'] === null ? 0: ((p['net_contract_price'] - p['msp']) * p['annual_usage_volume']).toFixed(2))
        discount1 += (p['list_price'] === null || p['net_contract_price'] === null || p['annual_usage_volume'] === null ? 0: p['list_price'] - p['net_contract_price']) * p['annual_usage_volume']
        discount2 += p['list_price'] === null || p['annual_usage_volume'] === null ? 0: p['list_price'] * p['annual_usage_volume']

    })

    const calculateProduct = {
        "total_revenue": CurrencyConversion(total_revenue_count).replace(".00", " ").replace("$", "$ "),
        "total_margin": CurrencyConversion(total_margin_count.toFixed(0)).replace(".00", " ").replace("$", "$ "),
        "overall_percentage": ((total_margin_count / total_revenue_count) * 100).toFixed(1),
        "discount": ((discount1 / discount2) * 100).toFixed(1)
    }
    return calculateProduct;
}


// This function is Converting plain value into Currency format
export const CurrencyConversion = (value) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    return formatter.format(value)
}

export const getPnLData = (data) => {
    let revenue = {
        award_value:0,prior_actual_value:0, variance_price:0,variance_percent:0,pvm_price:0,pvm_volume:0,
    };
    let msp = {
        award_value:0,prior_actual_value:0, variance_price:0,variance_percent:0,pvm_price:0,pvm_volume:0
    };
    let gross_margin = {
        award_value:0,prior_actual_value:0, variance_price:0,variance_percent:0,pvm_price:0,pvm_volume:0
    };
    let gross_margin_percent = {
        award_value:0,prior_actual_value:0, variance_price:0,variance_percent:0,pvm_price:0,pvm_volume:0
    };

    data.map((row) => {
        let contractPrice;
        if (row['list_price'] !== row['net_contract_price'] && row['net_contract_price'] !== null) {
            contractPrice = row['net_contract_price'];
        } else if(row['list_price'] !== null){
            contractPrice = row['list_price'];
        } else{
            contractPrice = 0;
        }
        revenue.award_value += parseFloat((contractPrice * row['probable_volume']).toFixed(2)) || 0;
        msp.award_value += parseFloat((row['msp'] * row['probable_volume']).toFixed(2)) || 0;
        revenue.prior_actual_value += parseFloat((row['prior_asp'] * row['prior_actual_qty']).toFixed(2)) || 0;
        msp.prior_actual_value += parseFloat((row['msp'] * row['prior_actual_qty']).toFixed(2)) || 0;
        revenue.pvm_volume += parseFloat(((row['prior_actual_qty'] -row['probable_volume']) * row['prior_asp']).toFixed(2)) || 0;
        revenue.pvm_price += parseFloat(((row['prior_asp'] - contractPrice) * row['probable_volume']).toFixed(2)) || 0;
        msp.pvm_volume += parseFloat(((row['prior_actual_qty'] -row['probable_volume']) * row['msp']).toFixed(2)) || 0;   
        msp.pvm_price += parseFloat((( row['msp'] - row['msp']) * row['probable_volume']).toFixed(2)) || 0;
    });

    gross_margin.award_value = parseFloat(revenue.award_value - msp.award_value).toFixed(2) || 0;
    gross_margin.prior_actual_value = parseFloat(revenue.prior_actual_value - msp.prior_actual_value).toFixed(2) || 0;
    gross_margin_percent.award_value = Math.round(parseFloat((gross_margin.award_value / revenue.award_value).toFixed(2)) * 100 * 100) / 100 || 0;
    gross_margin_percent.prior_actual_value = Math.round(parseFloat((gross_margin.prior_actual_value / revenue.prior_actual_value).toFixed(2)) * 100 * 100) / 100 || 0;
    gross_margin.pvm_volume = Math.round(parseFloat((revenue.pvm_volume - msp.pvm_volume).toFixed(2)) * 100) / 100 || 0;
    gross_margin.pvm_price = Math.round(parseFloat((revenue.pvm_price - msp.pvm_price).toFixed(2))*100)/100 || 0;
    msp.award_value = Math.round(msp.award_value * 100) / 100;
    msp.pvm_price = Math.round(msp.pvm_price * 100) / 100;

    let returnData = [
        {
            a:"Probable Revenue",...revenue
        },
        {
            a:"MSP", ...msp
        },
        {
            a:"GM$",...gross_margin
        },
        {
            a:"GM%", ...gross_margin_percent
        }
    ];

    returnData.map((row)=>{
        if (row.a !== "GM%"){
            row.variance_price = Math.round(parseFloat(row.award_value - row.prior_actual_value).toFixed(2)*100)/100 || 0;
            row.variance_percent = Math.round(parseFloat(((row.award_value - row.prior_actual_value)/row.award_value).toFixed(2)) * 100 * 100)/100 || 0;
        }
    })

    return returnData;
}
