"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require('restify');
const restifyErrors = require('restify-errors');
const logger = require('../logger');
const azuresubs_1 = require("./azuresubs");
const parseDataFromAzureApi_1 = require("./parseDataFromAzureApi");
const config = require("../../config/default.json");
const azuresubs = new azuresubs_1.AzureUsageDetails();
const parsingAzureDataObj = new parseDataFromAzureApi_1.ParsingAzureData();
const resourceGroup = 'resourceGroup';
const resourceType = 'resourceType';
const port = config.serverconf.port;
let url;
let subsData;
exports.server = restify.createServer({
    name: 'restify started'
});
exports.server.use(restify.plugins.bodyParser());
exports.server.post('/azureData', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    if (!req.body) {
        res.send(400, 'Please give any query');
        return next(new restifyErrors.BadRequestError());
    }
    else {
        try {
            if ((req.body).hasOwnProperty('filteredData') && (req.body.filteredData).hasOwnProperty('filter') && (req.body.filteredData).hasOwnProperty('dateRange') && (req.body.filteredData).hasOwnProperty('intent')) {
                if (req.body.filteredData.intent === "trend" && req.body.filteredData.queryBy === "billingPeriod") {
                    url = azuresubs.generateAzureAPI(req.body);
                    logger.info("url  " + url);
                    subsData = yield azuresubs.getAzureUsageDetails(url);
                    if (subsData.hasOwnProperty('error')) {
                        res.send(401, subsData);
                    }
                    let dates = parsingAzureDataObj.findDatesFromBillingPeriodForTrend(subsData, req.body.filteredData.dateRange);
                    req.body.filteredData.dateRange = dates['dateRange'];
                    req.body.filteredData.midRange = dates['midRange'];
                    req.body.filteredData.queryBy = "userChoice";
                    logger.info("In config " + dates);
                    url = azuresubs.generateAzureAPI(req.body);
                }
                else if (req.body.filteredData.intent === "cost" && req.body.filteredData.queryBy == "billingPeriod") {
                    if (req.body.filteredData.dateRange != "currentPeriod") {
                        url = azuresubs.generateAzureAPI(req.body);
                        subsData = yield azuresubs.getAzureUsageDetails(url);
                        if (subsData.hasOwnProperty('error')) {
                            res.send(401, subsData);
                        }
                        let billingPeriodDate = parsingAzureDataObj.findDatesFromBillingPeriod(subsData, req.body.filteredData.dateRange);
                        req.body.filteredData.dateRange = billingPeriodDate;
                        req.body.filteredData.queryBy = "userChoice";
                        url = azuresubs.generateAzureAPI(req.body);
                    }
                    else {
                        url = azuresubs.generateAzureAPI(req.body);
                    }
                }
                else {
                    url = azuresubs.generateAzureAPI(req.body);
                }
                logger.info("API " + url);
                subsData = yield azuresubs.getAzureUsageDetails(url);
                if (subsData.hasOwnProperty('error')) {
                    res.send(401, subsData);
                }
                let data = {};
                if (req.body.filteredData.intent == "cost" && req.body.filteredData.resources == resourceGroup) {
                    data['resourceGroup'] = parsingAzureDataObj.findCost(subsData);
                    if (data['resourceGroup'].keys.length !== 0) {
                        data['resourceType'] = parsingAzureDataObj.findmeterCost(subsData);
                        data['dates'] = parsingAzureDataObj.findDates(subsData);
                    }
                }
                else if (req.body.filteredData.intent == "cost" && req.body.filteredData.resources == resourceType)
                    data = parsingAzureDataObj.findResourcetypeCost(subsData);
                else if (req.body.filteredData.intent == "trend") {
                    data = parsingAzureDataObj.findTrendCost(subsData, req.body.filteredData.midRange);
                }
                else if (req.body.filteredData.intent == "breakDown") {
                    if (req.body.filteredData.filter.length != 0) {
                        data = parsingAzureDataObj.findBreakdown(subsData);
                    }
                    else if (req.body.filteredData.breakDown == 'resourceType') {
                        data = parsingAzureDataObj.findmeterCost(subsData);
                    }
                    else if (req.body.filteredData.breakDown == 'dates') {
                        data = parsingAzureDataObj.findDates(subsData);
                    }
                }
                else if (req.body.filteredData.intent === "billingPeriod") {
                    data = parsingAzureDataObj.billingPeriod(subsData);
                }
                else if (req.body.filteredData.intent == "usageQuantity") {
                    if (req.body.filteredData.resources === resourceGroup)
                        data = parsingAzureDataObj.FindUsageQuantity(subsData);
                    else {
                        data = parsingAzureDataObj.FindUsageQuantityForResourceType(subsData);
                        logger.info(data);
                    }
                }
                res.send(200, data);
            }
            else
                res.send(422, null);
            return next();
        }
        catch (err) {
            logger.error(err + "happend while hitting azure api");
        }
    }
}));
exports.server.listen(port, () => {
    logger.info(`Running in ${port}`);
});
