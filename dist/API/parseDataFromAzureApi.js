"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const logger = require("../logger");
class ParsingAzureData {
    findCost(azureData) {
        if (azureData.hasOwnProperty('value')) {
            let totalRecords = azureData['value'].length;
            let resourceCost = {};
            let resourceCostWithOthers = {};
            let otherCost = 0;
            let totalCost = 0;
            let currencyUsed;
            let startDate, endDate;
            try {
                for (let idx = 0; idx < totalRecords; idx++) {
                    if (idx == 0) {
                        currencyUsed = azureData.value[idx].properties.currency;
                    }
                    if (resourceCost.hasOwnProperty(azureData.value[idx].properties.instanceName)) {
                        resourceCost[azureData.value[idx].properties.instanceName] += azureData.value[idx].properties.pretaxCost;
                    }
                    else {
                        resourceCost[azureData.value[idx].properties.instanceName] = azureData.value[idx].properties.pretaxCost;
                    }
                    totalCost += azureData.value[idx].properties.pretaxCost;
                }
                let usageDates = azureData['value'].map(function (data) {
                    return moment(data.properties.usageStart.slice(0, 10), 'YYYY-MM-DD');
                });
                startDate = moment.min(usageDates);
                endDate = moment.max(usageDates);
                let keysSorted = Object.keys(resourceCost).sort(function (a, b) { return resourceCost[b] - resourceCost[a]; });
                resourceCost['keys'] = keysSorted;
                for (let idx = 0; idx < resourceCost['keys'].length; idx++) {
                    if (idx <= 4)
                        resourceCostWithOthers[resourceCost['keys'][idx]] = resourceCost[resourceCost['keys'][idx]];
                    else
                        otherCost += resourceCost[resourceCost['keys'][idx]];
                }
                if (otherCost != 0)
                    resourceCostWithOthers['others'] = otherCost;
                resourceCostWithOthers['keys'] = Object.keys(resourceCostWithOthers);
                resourceCostWithOthers['totalCost'] = totalCost;
                resourceCostWithOthers['currency'] = currencyUsed;
                resourceCostWithOthers['usageDate'] = `${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`;
                console.log(resourceCostWithOthers);
                return resourceCostWithOthers;
            }
            catch (e) {
                logger.error(e + " Occurs on findCost function");
            }
        }
        else
            return "Invalid input";
    }
    sortingValues(params) {
        let sortedOrder = Object.keys(params).sort(function (a, b) { return params[b] - params[a]; });
        return sortedOrder;
    }
    findmeterCost(azureData) {
        let meterCategory = {};
        let totalCost = 0;
        let currencyUsed;
        let otherCost = 0;
        let startDate, endDate;
        if (azureData.hasOwnProperty('value')) {
            let total_records = azureData.value.length;
            try {
                for (let itr = 0; itr < total_records; itr++) {
                    if (itr == 0) {
                        currencyUsed = azureData.value[itr].properties.currency;
                        startDate = moment((azureData.value[itr].properties.usageStart).slice(0, 10));
                    }
                    if (meterCategory.hasOwnProperty(azureData.value[itr].properties.instanceName)) {
                        let temp_instance_name = azureData.value[itr].properties.instanceName;
                        if (meterCategory[temp_instance_name].hasOwnProperty(azureData.value[itr].properties.meterDetails.meterCategory)) {
                            meterCategory[temp_instance_name][azureData.value[itr].properties.meterDetails.meterCategory] += azureData.value[itr].properties.pretaxCost;
                        }
                        else {
                            meterCategory[temp_instance_name][azureData.value[itr].properties.meterDetails.meterCategory] = azureData.value[itr].properties.pretaxCost;
                        }
                        totalCost += azureData.value[itr].properties.pretaxCost;
                    }
                    else {
                        meterCategory[azureData.value[itr].properties.instanceName] = {};
                        itr--;
                    }
                    if (itr === total_records - 1)
                        endDate = moment((azureData.value[itr].properties.usageStart).slice(0, 10));
                }
            }
            catch (e) {
                logger.error(e + " occured on find meter category function");
            }
            var resource = (Object.keys(meterCategory));
            let resourcegroup = {};
            for (let i = 0; i < resource.length; i++) {
                let type = Object.keys(meterCategory[resource[i]]);
                let sum = 0;
                for (let j = 0; j < type.length; j++) {
                    sum += (meterCategory[resource[i]][type[j]]);
                }
                resourcegroup[resource[i]] = sum;
            }
            let resourcegroupSorted = this.sortingValues(resourcegroup);
            let resourcetypeResult = {};
            for (let i = 0; i < resourcegroupSorted.length; i++) {
                resourcetypeResult[resourcegroupSorted[i]] = meterCategory[resourcegroupSorted[i]];
            }
            let keysSorted = Object.keys(resourcetypeResult).sort(function (a, b) { return resourcetypeResult[b] - resourcetypeResult[a]; });
            resourcetypeResult['keys'] = keysSorted;
            resourcetypeResult['totalCost'] = totalCost;
            resourcetypeResult['currency'] = currencyUsed;
            resourcetypeResult['usageDate'] = `${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`;
            return resourcetypeResult;
        }
        else
            return "Invalid input";
    }
    findBreakdown(azureData) {
        let breakdownbyDates = {};
        let currencyUsed;
        let dates;
        let totalCost = 0;
        if (azureData.hasOwnProperty('value')) {
            let totalRecords = azureData['value'].length;
            for (let itr = 0; itr < totalRecords; itr++) {
                if (itr == 0)
                    currencyUsed = azureData.value[itr].properties.currency;
                dates = (azureData.value[itr].properties.usageStart).slice(0, 10);
                if (breakdownbyDates.hasOwnProperty(dates)) {
                    if (breakdownbyDates[dates].hasOwnProperty(azureData.value[itr].properties.instanceName)) {
                        breakdownbyDates[dates][azureData.value[itr].properties.instanceName] += azureData.value[itr].properties.pretaxCost;
                    }
                    else {
                        breakdownbyDates[dates][azureData.value[itr].properties.instanceName] = azureData.value[itr].properties.pretaxCost;
                    }
                }
                else {
                    breakdownbyDates[dates] = {};
                    itr--;
                }
            }
        }
        breakdownbyDates['keys'] = Object.keys(breakdownbyDates);
        breakdownbyDates['currency'] = currencyUsed;
        return breakdownbyDates;
    }
    findTrendCost(azureData, date) {
        let result = {
            "old": {},
            "current": {}
        };
        let oldTotal = 0;
        let currentTotal = 0;
        let startDate, endDate;
        try {
            let totalRecords = azureData['value'].length;
            for (let idx = 0; idx < totalRecords; idx++) {
                if (idx == 0) {
                    result['currency'] = azureData.value[idx].properties.currency;
                }
                if (moment((azureData.value[idx].properties.usageStart).slice(0, 10)).isBefore(date)) {
                    if (result['old'].hasOwnProperty(azureData.value[idx].properties.instanceName))
                        result['old'][azureData.value[idx].properties.instanceName] += azureData.value[idx].properties.pretaxCost;
                    else
                        result['old'][azureData.value[idx].properties.instanceName] = azureData.value[idx].properties.pretaxCost;
                    oldTotal += azureData.value[idx].properties.pretaxCost;
                }
                else {
                    if (result['current'].hasOwnProperty(azureData.value[idx].properties.instanceName))
                        result['current'][azureData.value[idx].properties.instanceName] += azureData.value[idx].properties.pretaxCost;
                    else
                        result['current'][azureData.value[idx].properties.instanceName] = azureData.value[idx].properties.pretaxCost;
                    currentTotal += azureData.value[idx].properties.pretaxCost;
                }
            }
            let keysSorted = Object.keys(result['old']).sort(function (a, b) { return result['old'][b] - result['old'][a]; });
            result['oldKeys'] = keysSorted;
            keysSorted = Object.keys(result['current']).sort(function (a, b) { return result['current'][b] - result['current'][a]; });
            result['currentKeys'] = keysSorted;
            result['old']['Total'] = oldTotal;
            result['current']['Total'] = currentTotal;
            let usageDates = azureData['value'].map(function (data) {
                return moment(data.properties.usageStart.slice(0, 10), 'YYYY-MM-DD');
            });
            startDate = moment.min(usageDates);
            endDate = moment.max(usageDates);
            date = moment(date, "YYYY-MM-DD");
            date = date.subtract(1, 'day');
            result['OldDate'] = `${startDate.format("YYYY-MM-DD")} to ${date.format("YYYY-MM-DD")}`;
            result['CurrentDate'] = `${date.add(1, 'day').format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`;
            return result;
        }
        catch (e) {
            logger.error(e + " Occurs on finding Trend cost");
        }
    }
    findDates(azureData) {
        let breakdown = {};
        let currencyUsed;
        let dates;
        let totalCost = 0;
        if (azureData.hasOwnProperty('value')) {
            let totalRecords = azureData['value'].length;
            for (let itr = 0; itr < totalRecords; itr++) {
                if (itr == 0)
                    currencyUsed = azureData.value[itr].properties.currency;
                dates = (azureData.value[itr].properties.usageStart).slice(0, 10);
                if (breakdown.hasOwnProperty(dates)) {
                    breakdown[dates] += azureData.value[itr].properties.pretaxCost;
                    totalCost += azureData.value[itr].properties.pretaxCost;
                }
                else {
                    breakdown[dates] = 0;
                    itr--;
                }
            }
        }
        let keysSorted = Object.keys(breakdown).sort(function (a, b) { return breakdown[b] - breakdown[a]; });
        breakdown['keys'] = keysSorted;
        breakdown['totalCost'] = totalCost;
        breakdown['currency'] = currencyUsed;
        return breakdown;
    }
    findDatesFromBillingPeriod(azureData, date) {
        let totalRecords = azureData['value'].length;
        let dates = date.split('to');
        let startDate = moment(dates[0].trim()).format("YYYY-MM-DD");
        let endDate = moment(dates[1].trim()).format("YYYY-MM-DD");
        for (let idx = 0; idx < totalRecords; idx++) {
            let start = moment(azureData['value'][idx]['properties']['billingPeriodStartDate'].trim()).format("YYYY-MM-DD");
            logger.info("start " + start);
            if (moment(startDate).isAfter(start)) {
                let end = moment(azureData['value'][idx]['properties']['billingPeriodEndDate'], "YYYY-MM-DD");
                endDate = moment(end).format("YYYY-MM-DD");
                return `${start} to ${endDate}`;
            }
        }
    }
    findDatesFromBillingPeriodForTrend(azureData, date) {
        let result = {
            "DateRange": null,
            "MidRange": null
        };
        let totalRecords = azureData['value'].length;
        if (date === "CurrentPeriod" && totalRecords > 1) {
            let end = moment(azureData['value'][0]['properties']['billingPeriodEndDate'], "YYYY-MM-DD");
            result['DateRange'] = `${azureData['value'][1]['properties']['billingPeriodStartDate']} to ${end.format("YYYY-MM-DD")}`;
            result['MidRange'] = azureData['value'][0]['properties']['billingPeriodStartDate'];
            return result;
        }
        else {
            let dates = date.split('to');
            logger.info("dates " + dates);
            let startDate = moment(dates[0].trim()).format("YYYY-MM-DD");
            let endDate = moment(dates[1].trim()).format("YYYY-MM-DD");
            console.log(startDate + " " + endDate);
            for (let idx = 0; idx < totalRecords; idx++) {
                let start = moment(azureData['value'][idx]['properties']['billingPeriodStartDate'].trim()).format("YYYY-MM-DD");
                logger.info("start " + start);
                if (moment(startDate).isAfter(start)) {
                    if (idx !== totalRecords - 1) {
                        let end = moment(azureData['value'][idx]['properties']['billingPeriodEndDate'], "YYYY-MM-DD");
                        result['DateRange'] = `${azureData['value'][idx + 1]['properties']['billingPeriodStartDate']} to ${end.format("YYYY-MM-DD")}`;
                        result['MidRange'] = azureData['value'][idx]['properties']['billingPeriodStartDate'];
                        return result;
                    }
                }
            }
        }
        return "";
    }
    FindUsageQuantity(azureData) {
        if (azureData.hasOwnProperty('value')) {
            let totalRecords = azureData['value'].length;
            let totalusage = 0;
            let usageQuantity = {};
            let usageQuantityWithOthers = {};
            let othersCost = 0;
            try {
                for (let idx = 0; idx < totalRecords; idx++) {
                    if (usageQuantity.hasOwnProperty(azureData.value[idx].properties.instanceName)) {
                        usageQuantity[azureData.value[idx].properties.instanceName] += azureData.value[idx].properties.usageQuantity;
                    }
                    else {
                        usageQuantity[azureData.value[idx].properties.instanceName] = azureData.value[idx].properties.usageQuantity;
                    }
                    totalusage += azureData.value[idx].properties.usageQuantity;
                }
            }
            catch (e) {
                logger.error(e + " occured while finding the Usage Quantity");
            }
            let keysSorted = Object.keys(usageQuantity).sort(function (a, b) { return usageQuantity[b] - usageQuantity[a]; });
            usageQuantity['keys'] = keysSorted;
            for (let idx = 0; idx < usageQuantity['keys'].length; idx++) {
                if (idx <= 4)
                    usageQuantityWithOthers[usageQuantity['keys'][idx]] = usageQuantity[usageQuantity['keys'][idx]];
                else
                    othersCost += usageQuantity[usageQuantity['keys'][idx]];
            }
            let UsageDates = azureData['value'].map(function (data) {
                return moment(data.properties.usageStart.slice(0, 10), 'YYYY-MM-DD');
            });
            let startDate = moment.min(UsageDates);
            let endDate = moment.max(UsageDates);
            usageQuantityWithOthers['keys'] = Object.keys(usageQuantityWithOthers);
            usageQuantityWithOthers['totalusage'] = totalusage;
            usageQuantityWithOthers['usageDate'] = `${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`;
            return usageQuantityWithOthers;
        }
        else
            return "Invalid input";
    }
    findResourcetypeCost(azureData) {
        let meterCategory = {};
        let totalCost = 0;
        let currencyUsed;
        let startDate, endDate;
        let resourceTypeWithOthers = {};
        let otherCost = 0;
        if (azureData.hasOwnProperty('value')) {
            let total_records = azureData.value.length;
            try {
                for (let itr = 0; itr < total_records; itr++) {
                    if (itr == 0) {
                        currencyUsed = azureData.value[itr].properties.currency;
                        startDate = moment((azureData.value[itr].properties.usageStart).slice(0, 10));
                    }
                    if (meterCategory.hasOwnProperty(azureData.value[itr].properties.instanceName)) {
                        let temp_instance_name = azureData.value[itr].properties.instanceName;
                        if (meterCategory[temp_instance_name].hasOwnProperty(azureData.value[itr].properties.meterDetails.meterCategory)) {
                            meterCategory[temp_instance_name][azureData.value[itr].properties.meterDetails.meterCategory] += azureData.value[itr].properties.pretaxCost;
                        }
                        else {
                            meterCategory[temp_instance_name][azureData.value[itr].properties.meterDetails.meterCategory] = azureData.value[itr].properties.pretaxCost;
                        }
                        totalCost += azureData.value[itr].properties.pretaxCost;
                    }
                    else {
                        meterCategory[azureData.value[itr].properties.instanceName] = {};
                        itr--;
                    }
                    if (itr === total_records - 1)
                        endDate = moment((azureData.value[itr].properties.usageStart).slice(0, 10));
                }
                var resource = (Object.keys(meterCategory));
                let resourcetype = {};
                for (let i = 0; i < resource.length; i++) {
                    let type = Object.keys(meterCategory[resource[i]]);
                    for (let j = 0; j < type.length; j++) {
                        if (resourcetype.hasOwnProperty(type[j])) {
                            resourcetype[type[j]] += meterCategory[resource[i]][type[j]];
                        }
                        else
                            resourcetype[type[j]] = meterCategory[resource[i]][type[j]];
                    }
                }
                let keysSorted = Object.keys(resourcetype).sort(function (a, b) { return resourcetype[b] - resourcetype[a]; });
                resourcetype['keys'] = keysSorted;
                let usageDates = azureData['value'].map(function (data) {
                    return moment(data.properties.usageStart.slice(0, 10), 'YYYY-MM-DD');
                });
                startDate = moment.min(usageDates);
                endDate = moment.max(usageDates);
                for (let idx = 0; idx < resourcetype['keys'].length; idx++) {
                    if (idx <= 4)
                        resourceTypeWithOthers[resourcetype['keys'][idx]] = resourcetype[resourcetype['keys'][idx]];
                    else
                        otherCost += resourcetype[resourcetype['keys'][idx]];
                }
                if (otherCost != 0)
                    resourceTypeWithOthers['others'] = otherCost;
                resourceTypeWithOthers['keys'] = Object.keys(resourceTypeWithOthers);
                resourceTypeWithOthers['currency'] = currencyUsed;
                resourceTypeWithOthers['totalCost'] = totalCost;
                resourceTypeWithOthers['usageDate'] = `${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`;
                return resourceTypeWithOthers;
            }
            catch (e) {
                logger.error(e + " occured on find meter category function");
            }
        }
    }
    FindUsageQuantityForResourceType(azureData) {
        if (azureData.hasOwnProperty('value')) {
            let totalRecords = azureData['value'].length;
            let totalusage = 0;
            let usageQuantity = {};
            try {
                for (let idx = 0; idx < totalRecords; idx++) {
                    if (usageQuantity.hasOwnProperty(azureData.value[idx].properties.meterDetails.meterCategory))
                        usageQuantity[azureData.value[idx].properties.meterDetails.meterCategory] += azureData.value[idx].properties.usageQuantity;
                    else
                        usageQuantity[azureData.value[idx].properties.meterDetails.meterCategory] = azureData.value[idx].properties.usageQuantity;
                    totalusage += azureData.value[idx].properties.usageQuantity;
                }
                let keysSorted = Object.keys(usageQuantity).sort(function (a, b) { return usageQuantity[b] - usageQuantity[a]; });
                usageQuantity['keys'] = keysSorted;
                usageQuantity['totalusage'] = totalusage;
                let usageDates = azureData['value'].map(function (data) {
                    return moment(data.properties.usageStart.slice(0, 10), 'YYYY-MM-DD');
                });
                let startDate = moment.min(usageDates);
                let endDate = moment.max(usageDates);
                usageQuantity['usageDate'] = `${startDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`;
                return usageQuantity;
            }
            catch (e) {
                logger.error(e + " Occurs on find usage quantity for resource type");
            }
        }
        else
            return "Invalid input";
    }
}
exports.ParsingAzureData = ParsingAzureData;
