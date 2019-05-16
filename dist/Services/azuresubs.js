"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const msRestAzure = require("ms-rest-azure");
const request = require("request");
const logger = require("../logger");
const config = require("../../config/default.json");
const moment = require("moment");
class AzureUsageDetails {
    generateAzureAPI(filterData) {
        try {
            const subscriptionId = config.userDetails.subscriptionId;
            let filterquery = null;
            if (filterData.hasOwnProperty('filteredData') && filterData['filteredData'].hasOwnProperty('intent') && filterData['filteredData'].hasOwnProperty('filter') && filterData['filteredData'].hasOwnProperty('dateRange')) {
                let filterLength = filterData['filteredData']['filter'].length;
                if (filterData['filteredData']['queryBy'] === "billingPeriod" && filterData['filteredData']['intent'] === "trend") {
                    return `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Billing/billingPeriods?api-version=2017-04-24-preview`;
                }
                if (filterData['filteredData']['intent'] === "cost" && filterData['filteredData']['dateRange'] != "currentPeriod" && filterData['filteredData']['queryBy'] === "billingPeriod") {
                    return `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Billing/billingPeriods?api-version=2017-04-24-preview`;
                }
                if (filterData['filteredData']['dateRange'] != "currentPeriod") {
                    let dates = filterData['filteredData']['dateRange'].split('to');
                    let endDate = moment(dates[1]);
                    filterquery = `(properties/usageStart ge '${dates[0]}' AND properties/usageEnd le '${endDate.format("YYYY-MM-DD")}')`;
                }
                if (filterData['filteredData']['intent'] === "billingPeriod") {
                    return `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Billing/billingPeriods?api-version=2017-04-24-preview`;
                }
                if (filterLength != 0 && filterData['filteredData']['resources'] === config.Resources.ResourceGroup) {
                    if (filterquery == null)
                        filterquery = '(';
                    else
                        filterquery += `AND (`;
                    for (let idx = 0; idx < filterLength; idx++) {
                        filterquery += `properties/instanceName eq '${filterData['filteredData']['filter'][idx].value}'`;
                        if (idx != filterLength - 1)
                            filterquery += 'OR ';
                    }
                    filterquery += `) AND tags eq 'dev:tools'`;
                }
                return `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Consumption/usageDetails?$expand=properties/meterDetails&$filter=${filterquery}&api-version=2018-10-01`;
            }
            else
                return "Invalid input";
        }
        catch (e) {
            logger.error(e + " Occurs on generating the azure API");
        }
    }
    getAzureUsageDetails(currentUrl, userToken) {
        try {
            return new Promise((resolve, reject) => {
                request.get({
                    url: currentUrl,
                    headers: {
                        "Authorization": "Bearer " + userToken
                    }
                }, function (err, response, body) {
                    if (err)
                        reject(err);
                    else if (body && response.statusCode === 200) {
                        resolve(JSON.parse(body));
                    }
                    else if (body && response.statusCode === 401 && body.hasOwnProperty('error')) {
                        resolve({ "error": "Token expired" });
                    }
                });
            });
        }
        catch (error) {
            console.log(error + " get error in get user details");
        }
    }
}
exports.AzureUsageDetails = AzureUsageDetails;
