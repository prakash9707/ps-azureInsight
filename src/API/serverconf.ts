const restify = require('restify');
const restifyErrors = require('restify-errors');
const logger = require('../logger');
import { AZUREUsageDetails } from "../API/azuresubs";
import { ParsingAzureData } from "../API/parseDataFromAzureApi";
const config = require("../../config/default.json");
const azuresubs = new AZUREUsageDetails();
const parsingAzureDataObj = new ParsingAzureData();
const resourceGroup = 'resourceGroup';
const resourceType = 'resourceType';
const port = config.serverconf.port;
let url: string;
let subsData: any;



export const server = restify.createServer({
    name: 'restify started'
});

server.use(restify.plugins.bodyParser());

server.post('/azureData', async (req, res, next) => { // defining what your API needs to do with the input....

    if (!req.body) {
        res.send(400, 'Please give any query');
        return next(new restifyErrors.BadRequestError());
    }
    else {
        try {
            if ((req.body).hasOwnProperty('filteredData') && (req.body.filteredData).hasOwnProperty('filter') && (req.body.filteredData).hasOwnProperty('dateRange') && (req.body.filteredData).hasOwnProperty('intent')) {
                if (req.body.filteredData.intent === "trend" && req.body.filteredData.QueryBy === "billingPeriod") {
                    url = azuresubs.generateAzureAPI(req.body);
                    logger.info("url" + url);
                    subsData = await azuresubs.getAzureUsageDetails(url);
                    let dates = parsingAzureDataObj.findDatesFromBillingPeriodForTrend(subsData, req.body.filteredData.DateRange);
                    req.body.filteredData.DateRange = dates['dateRange'];
                    req.body.filteredData.MidRange = dates['midRange'];
                    req.body.filteredData.QueryBy = "userChoice";
                    logger.info("In config " + dates);
                    url = azuresubs.generateAzureAPI(req.body);
                }

                else if (req.body.filteredData.intent === "cost" && req.body.filteredData.QueryBy == "billingPeriod") {
                    // let currentMonthDate = `${moment().startOf('month').format("YYYY-MM-DD")} to ${moment().endOf('month').format("YYYY-MM-DD")}`;
                    if (req.body.filteredData.dateRange != "currentPeriod") {
                        url = azuresubs.generateAzureAPI(req.body);
                        subsData = await azuresubs.getAzureUsageDetails(url);
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
                
                logger.info("API "+ url);
                console.log("conf",url);
                subsData = await azuresubs.getAzureUsageDetails(url);
                //console.log("azure data", subsData);
                let data: any = {};


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
                else if (req.body.filteredData.intent == "breakdown") {
                    if (req.body.filteredData.filter.length != 0) {
                        //calling the findBreakdown  for Breakdown by particular resource group
                        data = parsingAzureDataObj.findBreakdown(subsData);
                    }
                    else if (req.body.filteredData.Resources == resourceType) {
                        //calling the findmeterCost for Breakdown by whole resource type
                        data = parsingAzureDataObj.findmeterCost(subsData);
                    }
                    else if (req.body.filteredData.filter.length == 0) {
                        //calling the findDates for breakdown by dates..
                        data = parsingAzureDataObj.findDates(subsData);
                    }
                }

                else if (req.body.filteredData.Intent == "usageQuantity") {
                    if (req.body.filteredData.Resources === resourceGroup)
                        data = parsingAzureDataObj.FindUsageQuantity(subsData);
                    else {
                        data = parsingAzureDataObj.FindUsageQuantityForResourceType(subsData);
                        logger.info(data);
                    }
                }
                console.log("data", data);
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

});


server.listen(port, () => {
    logger.info(`Running in ${port}`);
});
