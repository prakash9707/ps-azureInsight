"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
function FilterForLuisData(getLuisData) {
    if (getLuisData.hasOwnProperty('entities') && getLuisData.hasOwnProperty('topScoringIntent')) {
        try {
            let entityLength = getLuisData['entities'].length;
            let startDate = null, endDate = null;
            let resourceGroupNames = 'resourceGroupNames';
            let resourceTypeNames = 'resourceTypeNames';
            let userMonth = 'builtin.datetimeV2.daterange';
            let userDate = 'builtin.datetimeV2.date';
            let resources = 'resources';
            let number = 'builtin.number';
            let filterLuis = {
                "filter": [],
                "resources": null,
                "queryBy": null,
                "dateRange": null,
                "intent": null,
                "breakDown": null
            };
            filterLuis["intent"] = getLuisData['topScoringIntent']['intent'];
            for (let idx = 0; idx < entityLength; idx++) {
                if (getLuisData['entities'][idx]['type'] == number && getLuisData['entities'][idx].resolution.value < 100)
                    filterLuis['number'] = getLuisData['entities'][idx].resolution.value;
                else if (getLuisData['entities'][idx]['type'] == resources)
                    filterLuis['resources'] = getLuisData['entities'][idx].resolution.values[0];
                else if (getLuisData['entities'][idx]['type'] == resourceGroupNames) {
                    filterLuis.filter.push({
                        "category": "resourceGroup",
                        "value": getLuisData['entities'][idx]['resolution'].values[0]
                    });
                    filterLuis['resources'] = "resourceGroup";
                }
                else if (getLuisData['entities'][idx]['type'] == resourceTypeNames) {
                    filterLuis.filter.push({
                        "category": "resourceType",
                        "value": getLuisData['entities'][idx]['resolution'].values[0]
                    });
                    filterLuis['resources'] = "resourceType";
                }
                else if (getLuisData['entities'][idx]['type'] == "breakDown")
                    filterLuis['breakDown'] = getLuisData['entities'][idx]['resolution'].values[0];
                else if (getLuisData['entities'][idx]['type'] == userMonth) {
                    let valuesLength = getLuisData['entities'][idx].resolution.values.length;
                    if (valuesLength == 1) {
                        startDate = getLuisData['entities'][idx].resolution.values[0].start;
                        endDate = moment(getLuisData['entities'][idx].resolution.values[0].end);
                    }
                    else {
                        let thisYearLastDate = moment().endOf('year').format('YYYY-MM-DD');
                        for (let itr = 0; itr < valuesLength; itr++) {
                            if (moment(thisYearLastDate).isAfter(getLuisData['entities'][idx].resolution.values[itr].start)) {
                                startDate = getLuisData['entities'][idx].resolution.values[itr].start;
                                endDate = moment(getLuisData['entities'][idx].resolution.values[itr].end);
                            }
                        }
                    }
                    endDate = endDate.subtract(1, 'day').format("YYYY-MM-DD");
                    filterLuis['queryBy'] = "userChoice";
                }
                else if (getLuisData['entities'][idx]['type'] === userDate) {
                    startDate = moment(getLuisData['entities'][idx].resolution.values[0].value).format("YYYY-MM-DD");
                    endDate = moment(getLuisData['entities'][idx].resolution.values[0].value).format("YYYY-MM-DD");
                    filterLuis['queryBy'] = "userChoice";
                }
                else if (getLuisData['entities'][idx]['type'] === "billing")
                    filterLuis['queryBy'] = "billingPeriod";
            }
            if (filterLuis['queryBy'] === null)
                filterLuis['queryBy'] = "billingPeriod";
            if (startDate !== null && endDate !== null)
                filterLuis['dateRange'] = `${startDate} to ${endDate}`;
            else {
                filterLuis['dateRange'] = "currentPeriod";
            }
            if (filterLuis['intent'] == "trend") {
                if (filterLuis['queryBy'] === "userChoice") {
                    if (startDate !== null && endDate !== null) {
                        filterLuis['resources'] = "resourceGroup";
                        startDate = moment(startDate, 'YYYY-MM-DD');
                        endDate = moment(endDate, 'YYYY-MM-DD');
                        let duration = moment.duration(endDate.diff(startDate));
                        let newStartDate = moment(startDate, 'YYYY-MM-DD');
                        let days = duration.asDays();
                        if (days >= 27 && days <= 31) {
                            newStartDate = newStartDate.subtract(1, 'month');
                        }
                        else if (days === 7) {
                            newStartDate = newStartDate.subtract(1, 'week');
                        }
                        else if (days === 0) {
                            newStartDate = newStartDate.subtract(1, 'day');
                        }
                        else {
                            newStartDate = newStartDate.subtract(days, 'day');
                        }
                        filterLuis['midRange'] = startDate.format("YYYY-MM-DD");
                        filterLuis['dateRange'] = `${newStartDate.format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}`;
                    }
                }
                else {
                    filterLuis['queryBy'] = "billingPeriod";
                    filterLuis['dateRange'] = "currentPeriod";
                    filterLuis['resources'] = "resourceGroup";
                    if (startDate !== null && endDate !== null)
                        filterLuis['dateRange'] = `${startDate} to ${endDate}`;
                    else
                        filterLuis['dateRange'] = `${moment().startOf('month').format("YYYY-MM-DD")} to ${moment().endOf("month").format("YYYY-MM-DD")}`;
                }
            }
            return filterLuis;
        }
        catch (e) {
            console.log(e + " Occuring on the filter file");
        }
    }
    else
        return "Invalid input is passed";
}
exports.FilterForLuisData = FilterForLuisData;
