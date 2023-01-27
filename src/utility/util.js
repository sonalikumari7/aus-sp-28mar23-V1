
// This function show filter column based on current column selection
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

// This function filtering data based on multiple column selection value selection 
export const filteringColumnSelection = (data, filtercolumnlist) => {
    let expression = sessionStorage.getItem("filterGlobal") || "";
    // let expression ="";
    if (expression && expression.length !== 0){
        expression += " && ";
    }
    let filterList = []
    for (let i in filtercolumnlist) {
        expression += "(";
        filtercolumnlist[i].forEach((r, index) => {
            expression += "item['" + i + "'] === '" + r["field"] + "'" +
                (index === filtercolumnlist[i].length - 1 ? "" : " || ");
        });
        expression += ") && "
    }
    expression = expression.replaceAll("() &&", "").replaceAll("'Blank'", null).trim();

    //  Create an expression for all selected Column value
    if (expression.endsWith("||") || expression.endsWith("&&")) {
        expression = expression.substring(0, expression.length - 2);
    }

    if (expression.length === 0) {
        const tempExpression = sessionStorage.getItem("filter")
        if (tempExpression === null) {
            filterList = data
            return filterList;
        }
        else {
            filterList = data.filter(item => eval(tempExpression))
            return filterList;
        }
    }
    else {
        sessionStorage.setItem("filter", expression)
        filterList = data.filter(item => eval(expression))
        return filterList;
    }
}

//to apply global filters on session item filterGlobal
export const filteringColumnSelectionGlobal = (data, filtercolumnlist) => {
    let expression = "";
    // let expression = sessionStorage.getItem("filter") || "";
    // if (expression && expression.length !== 0){
    //     expression += " && ";
    // }
    let filterList = []
    for (let i in filtercolumnlist) {
        expression += "(";
        filtercolumnlist[i].forEach((r, index) => {
            expression += "item['" + i + "'] === '" + r["field"] + "'" +
                (index === filtercolumnlist[i].length - 1 ? "" : " || ");
        });
        expression += ") && "
    }
    expression = expression.replaceAll("() &&", "").replaceAll("'Blank'", null).trim();

    //  Create an expression for all selected Column value
    if (expression.endsWith("||") || expression.endsWith("&&")) {
        expression = expression.substring(0, expression.length - 2);
    }

    if (expression.length === 0) {
        const tempExpression = sessionStorage.getItem("filterGlobal")
        if (tempExpression === null) {
            filterList = data
            return filterList;
        }
        else {
            filterList = data.filter(item => eval(tempExpression))
            return filterList;
        }
    }
    else {
        sessionStorage.setItem("filterGlobal", expression)
        filterList = data.filter(item => eval(expression))
        return filterList;
    }
}

/* 
 This function is calculate Total Revenue, Total Margin, Discount for  the Product details. 
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