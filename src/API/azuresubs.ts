const msRestAzure : any = require("ms-rest-azure");
import * as logger from "../logger";
const subscriptionId: string = '98846a4a-670c-426e-beac-362d79862397';
const config : any = require("../../config/default.json");
import * as moment from "moment";
export class AZUREUsageDetails {

    generateAzureAPI(filterData: any): string {

        try {
            let filterquery: string = null;
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

    getAzureUsageDetails(currentUrl: string) {
        try {
            return new Promise(function (resolve, reject) {

                const AzureServiceClient = msRestAzure.AzureServiceClient;
                const clientId = '4d689e3d-f9a8-4863-8845-cf4e7adfa421';
                const secret = 'f2167dc2-b08a-4d7b-a21a-a1d90912de86';
                const domain = '97a80a72-fec2-4577-81ad-2da2880ff7bb'; //also known as tenantId
                // const subscriptionId = '98846a4a-670c-426e-beac-362d79862397';

                msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain).then((creds) => {
                    var client = new AzureServiceClient(creds);
                    let options = {
                        method: 'GET',
                        url: currentUrl,
                        headers: {
                            'user-agent': 'MyTestApp/1.0'
                        }
                    }
                    return client.sendRequest(options);
                }).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }

            )
        } catch (err) {
            logger.error(err + "occurs on getting data from azure api");
        }
    }
}
