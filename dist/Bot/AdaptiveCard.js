"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdaptiveCard {
    AdaptiveCardForResources(cost, type, topCost) {
        let currency = cost['currency'];
        let data = [{
                "type": "ColumnSet",
                "columns": [
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": `**${type}**`,
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "left"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "**Cost**",
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "right"
                            }
                        ]
                    }
                ]
            }];
        let columns;
        for (let idx = 0; idx < topCost; idx++) {
            try {
                columns = {
                    "type": "ColumnSet",
                    "separator": true,
                    "columns": []
                };
                columns.columns.push({
                    "type": "Column",
                    "width": "1",
                    "items": [{
                            "type": "TextBlock",
                            "text": cost.keys[idx],
                            "size": "default",
                            "horizontalAlignment": "left"
                        }]
                });
                columns.columns.push({
                    "type": "Column",
                    "width": "1",
                    "items": [{
                            "type": "TextBlock",
                            "text": `${cost[cost.keys[idx]].toFixed(2)} ${currency}`,
                            "size": "default",
                            "horizontalAlignment": "right"
                        }]
                });
                data.push(columns);
            }
            catch (e) {
                console.log(e + " occured in printing data in card");
            }
        }
        columns = {
            "type": "ColumnSet",
            "separator": true,
            "columns": []
        };
        columns.columns.push({
            "type": "Column",
            "width": "1",
            "items": [{
                    "type": "TextBlock",
                    "text": "**TotalCost**",
                    "size": "default",
                    "horizontalAlignment": "left"
                }]
        });
        columns.columns.push({
            "type": "Column",
            "width": "1",
            "items": [{
                    "type": "TextBlock",
                    "text": `**${cost['totalCost'].toFixed(2)} ${currency}**`,
                    "size": "default",
                    "horizontalAlignment": "right"
                }]
        });
        data.push(columns);
        return data;
    }
    DatesBreakdown(dates) {
        let currency = dates['currency'];
        let data = [{
                "type": "ColumnSet",
                "columns": [
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": `**Date**`,
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "left"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "**Cost**",
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "right"
                            }
                        ]
                    }
                ]
            }];
        let obj;
        for (let idx = 0; idx < dates.keys.length; idx++) {
            try {
                obj = {
                    "type": "ColumnSet",
                    "separator": true,
                    "columns": []
                };
                obj.columns.push({
                    "type": "Column",
                    "width": "1",
                    "items": [{
                            "type": "TextBlock",
                            "text": dates.keys[idx],
                            "size": "default",
                            "horizontalAlignment": "left"
                        }]
                });
                obj.columns.push({
                    "type": "Column",
                    "width": "1",
                    "items": [{
                            "type": "TextBlock",
                            "text": `${dates[dates.keys[idx]].toFixed(2)} ${currency}`,
                            "size": "default",
                            "horizontalAlignment": "right"
                        }]
                });
                data.push(obj);
            }
            catch (e) {
                console.error(e + " occured in printing data in card");
            }
        }
        obj = {
            "type": "ColumnSet",
            "separator": true,
            "columns": []
        };
        obj.columns.push({
            "type": "Column",
            "width": "1",
            "items": [{
                    "type": "TextBlock",
                    "text": "**TotalCost**",
                    "size": "default",
                    "horizontalAlignment": "left"
                }]
        });
        obj.columns.push({
            "type": "Column",
            "width": "1",
            "items": [{
                    "type": "TextBlock",
                    "text": `**${dates['totalCost'].toFixed(2)} ${currency}**`,
                    "size": "default",
                    "horizontalAlignment": "right"
                }]
        });
        data.push(obj);
        return data;
    }
    resourcetypeData(result) {
        let currency = result['currency'];
        let data = [{
                "type": "ColumnSet",
                "columns": [
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": `**ResourceGroup**`,
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "left"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": `**Resourcetype**`,
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "right"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": `**Cost**`,
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "right"
                            }
                        ]
                    }
                ]
            }];
        let obj;
        for (let idx = 0; idx < result.keys.length; idx++) {
            let resourcetypeKeys = Object.keys(result[result.keys[idx]]);
            for (let itr = 0; itr < resourcetypeKeys.length; itr++) {
                try {
                    obj = {
                        "type": "ColumnSet",
                        "separator": true,
                        "columns": []
                    };
                    obj.columns.push({
                        "type": "Column",
                        "width": "1",
                        "items": [{
                                "type": "TextBlock",
                                "text": result.keys[idx],
                                "size": "default",
                                "horizontalAlignment": "left"
                            }]
                    });
                    obj.columns.push({
                        "type": "Column",
                        "width": "1",
                        "items": [{
                                "type": "TextBlock",
                                "text": resourcetypeKeys[itr],
                                "size": "default",
                                "horizontalAlignment": "right"
                            }]
                    });
                    obj.columns.push({
                        "type": "Column",
                        "width": "1",
                        "items": [{
                                "type": "TextBlock",
                                "text": `${result[result.keys[idx]][resourcetypeKeys[itr]].toFixed(2)} ${currency}`,
                                "size": "default",
                                "horizontalAlignment": "right"
                            }]
                    });
                    data.push(obj);
                }
                catch (e) {
                    console.error(e + " occured in printing data in card");
                }
            }
        }
        obj = {
            "type": "ColumnSet",
            "separator": true,
            "columns": []
        };
        obj.columns.push({
            "type": "Column",
            "width": "1",
            "items": [{
                    "type": "TextBlock",
                    "text": "**TotalCost**",
                    "size": "default",
                    "horizontalAlignment": "left"
                }]
        });
        obj.columns.push({
            "type": "Column",
            "width": "1",
            "items": [{
                    "type": "TextBlock",
                    "text": `**${result['totalCost'].toFixed(2)} ${currency}**`,
                    "size": "default",
                    "horizontalAlignment": "right"
                }]
        });
        data.push(obj);
        return data;
    }
    adaptiveCardForTrend(result, currentResourceName) {
        let currency = result['currency'];
        let data = [{
                "type": "ColumnSet",
                "columns": [
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": `**ResourceName**`,
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "left"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "**Cost**",
                                "isSubtle": false,
                                "size": "default",
                                "horizontalAlignment": "right"
                            }
                        ]
                    }
                ]
            }];
        let columnsSet;
        for (let idx = 0; idx < currentResourceName.length; idx++) {
            try {
                let previousCost;
                let resourceAvailableInOld = true;
                let currentTrend;
                let diff;
                if ((Number(result['current'][currentResourceName[idx]])) > 0) {
                    if (result['oldKeys'].indexOf(currentResourceName[idx]) >= 0)
                        previousCost = Number(result['old'][currentResourceName[idx]]).toFixed(2);
                    else {
                        resourceAvailableInOld = false;
                    }
                    let currentCost = Number(result['current'][currentResourceName[idx]]).toFixed(2);
                    console.log(currentCost);
                    if (resourceAvailableInOld && previousCost > Number(result['current'][currentResourceName[idx]].toFixed(2))) {
                        diff = previousCost - currentCost;
                        currentTrend = `(- ${diff.toFixed(2)})`;
                    }
                    else if (resourceAvailableInOld && previousCost < Number(result['current'][currentResourceName[idx]].toFixed(2))) {
                        diff = currentCost - previousCost;
                        currentTrend = `(+ ${diff.toFixed(2)})`;
                    }
                    else {
                        currentTrend = `( NA )`;
                    }
                    columnsSet = {
                        "type": "ColumnSet",
                        "separator": true,
                        "columns": []
                    };
                    columnsSet.columns.push({
                        "type": "Column",
                        "width": "1",
                        "items": [{
                                "type": "TextBlock",
                                "text": currentResourceName[idx],
                                "size": "default",
                                "horizontalAlignment": "left"
                            }]
                    });
                    columnsSet.columns.push({
                        "type": "Column",
                        "width": "1",
                        "items": [{
                                "type": "TextBlock",
                                "text": `${currentCost} ${currency} **${currentTrend}**`,
                                "size": "default",
                                "horizontalAlignment": "right"
                            }]
                    });
                    data.push(columnsSet);
                }
            }
            catch (e) {
                console.log(e + " occured in printing data in card");
            }
        }
        return data;
    }
}
exports.AdaptiveCard = AdaptiveCard;
