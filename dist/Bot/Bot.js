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
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const request = require("request");
const querystring = require("querystring");
const FilterTheLuis_1 = require("../API/FilterTheLuis");
const callapi_1 = require("../API/callapi");
const jwtDecode = require("jwt-decode");
const AdaptiveCard_1 = require("./AdaptiveCard");
const HeroCard_1 = require("./HeroCard");
const dialogStateProperty = "dialogStateProperty";
const confirmPrompt = "confirmPrompt";
const config = require('../../config/default.json');
const welcomeMessage = "welcomeMessage";
const cost = "cost";
const trend = "trend";
const breakDown = "breakDown";
const greeting = "greeting";
const promptForResource = "promptForResource";
const promptForBreakDown = "promptForBreakDown";
const breakDownForCost = "breakDownForCost";
const billingPeriod = "billingPeriod";
const heroCardObject = new HeroCard_1.HeroCard();
const adaptiveCardObject = new AdaptiveCard_1.AdaptiveCard();
const OAUTH_PROMPT = 'oAuth_prompt';
let userLoginToken = null;
const AUTH_DIALOG = 'auth_dialog';
const DATE_TIME_DIALOG = 'date_time_dialog';
const connection = 'BotOAuth';
const OAUTH_SETTINGS = {
    connectionName: connection,
    title: 'Log In',
    text: 'Please Log In',
    timeout: 300000
};
class AzureUsageBot {
    constructor(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = this.conversationState.createProperty(dialogStateProperty);
        this.filterForPrompt = this.userState.createProperty("createFilter");
        this.userCost = this.userState.createProperty("userCost");
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new botbuilder_dialogs_1.ChoicePrompt(confirmPrompt));
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(welcomeMessage, [
            this.askForStart.bind(this),
        ]));
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(promptForResource, [
            this.askForResource.bind(this),
            this.getResource.bind(this)
        ]));
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(promptForBreakDown, [
            this.askForBreakDown.bind(this),
            this.getBreakDown.bind(this)
        ]));
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(breakDownForCost, [
            this.askForBreakDownChoice.bind(this),
            this.getDataForBreakDown.bind(this)
        ]));
        this.dialogs.add(new botbuilder_dialogs_1.OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this.dialogs.add(new botbuilder_dialogs_1.DateTimePrompt(DATE_TIME_DIALOG));
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(AUTH_DIALOG, [
            this.oauthPrompt.bind(this),
            this.loginResults.bind(this)
        ]));
    }
    oauthPrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("coming");
            return yield step.prompt(OAUTH_PROMPT);
        });
    }
    loginResults(step) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("loginResults");
            let tokenResponse = step.result;
            console.log(tokenResponse);
            if (tokenResponse) {
                const claims = jwtDecode(tokenResponse['token']);
                console.log(claims);
                let userEmail = claims['email'];
                userLoginToken = tokenResponse['token'];
                yield step.context.sendActivity('You are now logged in sucessfully.');
                yield step.context.sendActivity(`Hi ${claims['email']}`);
                yield step.context.sendActivity(`This is your subscription id ${config.userDetails.subscriptionId}`);
                let dialogControl = yield this.dialogs.createContext(step.context);
                yield dialogControl.beginDialog(welcomeMessage);
            }
        });
    }
    askForStart(step) {
        return __awaiter(this, void 0, void 0, function* () {
            yield step.prompt(confirmPrompt, 'Do you want to see your details by ?', ["Cost", "Trend", "Break Down", "Billing Period"]);
            return yield step.endDialog();
        });
    }
    askForResource(step) {
        return __awaiter(this, void 0, void 0, function* () {
            yield step.prompt(confirmPrompt, 'Do you want to see your details by ?', ["resourceGroup", "resourceType"]);
        });
    }
    getResource(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result && step.result.value) {
                let billingDates;
                let filter = yield this.filterForPrompt.get(step.context, {});
                filter['filterData'].resources = step.result.value;
                console.log(filter['filterData']);
                let usageCost = yield callapi_1.callApi(filter['filterData']);
                let tempCost = yield this.userCost.get(step.context, {});
                tempCost.cost = usageCost;
                yield this.userCost.set(step.context, tempCost);
                if (usageCost['resourceGroup']['keys'].length > 0) {
                    let cardBody = adaptiveCardObject.AdaptiveCardForResources(usageCost['resourceGroup'], filter['filterData'].resources, usageCost['resourceGroup']['keys'].length);
                    yield this.createApativeCard(step.context, cardBody, usageCost['resourceGroup']['usageDate']);
                    const dialogControl = yield this.dialogs.createContext(step.context);
                    yield dialogControl.beginDialog(breakDownForCost);
                }
                else
                    yield step.context.sendActivity('Sorry no matched data was found or it may not cross even a rupee');
            }
        });
    }
    askForBreakDown(step) {
        return __awaiter(this, void 0, void 0, function* () {
            yield step.prompt(confirmPrompt, 'Do you want to break down by', ["dates", "resourceType"]);
        });
    }
    getBreakDown(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                let filter = yield this.filterForPrompt.get(step.context, {});
                filter['filterData'].breakDown = step.result.value;
                console.log(filter['filterData']);
                let billingDates;
                let usageCost;
                if (filter['filterData']['queryBy'] === "billingPeriod") {
                    billingDates = yield callapi_1.callApi(filter['filterData']);
                    console.log("dates ", billingDates);
                    if (billingDates) {
                        billingDates = billingDates.split('to');
                        filter['filterData']['queryBy'] = "userChoice";
                        filter['filterData']['dateRange'] = `${billingDates[0]} to ${billingDates[1]}`;
                    }
                    else {
                        yield step.context.sendActivity('No data was found');
                    }
                }
                if (filter['filterData']['queryBy'] === "userChoice") {
                    usageCost = yield callapi_1.callApi(filter['filterData']);
                    if (filter['filterData']['breakDown'] === "dates") {
                        let cardBody = adaptiveCardObject.DatesBreakdown(usageCost);
                        yield this.createApativeCard(step.context, cardBody, usageCost['usageDate']);
                    }
                    else {
                        let cardBody = adaptiveCardObject.resourcetypeData(usageCost);
                        yield this.createApativeCard(step.context, cardBody, usageCost['usageDate']);
                    }
                }
            }
        });
    }
    askForBreakDownChoice(step) {
        return __awaiter(this, void 0, void 0, function* () {
            yield step.prompt(confirmPrompt, 'Do you want to break down by', ["Dates", "ResourceType", "Display Chart", "no thanks"]);
        });
    }
    getDataForBreakDown(step) {
        return __awaiter(this, void 0, void 0, function* () {
            let usageCost = yield this.userCost.get(step.context, {});
            if (step.result) {
                if (step.result.value === "Dates") {
                    console.log(usageCost['dates']);
                    let cardBody = adaptiveCardObject.DatesBreakdown(usageCost['cost']['dates']);
                    yield this.createApativeCard(step.context, cardBody, usageCost['cost']['dates']['usageDate']);
                }
                else if (step.result.value === "ResourceType") {
                    let cardBody = adaptiveCardObject.resourcetypeData(usageCost['cost']['resourceType']);
                    yield this.createApativeCard(step.context, cardBody, usageCost['cost']['resourceType']['usageDate']);
                }
                else if (step.result.value === "Display Chart") {
                    yield step.context.sendActivity("Currently not available");
                }
                else if (step.result.value === "no thanks") {
                    yield step.context.sendActivity("Fine, If you have any question let me know");
                }
            }
            return yield step.endDialog();
        });
    }
    getLuisIntent(utterance) {
        var endpoint = config.luis.endPoint;
        var luisAppId = config.luis.luisAppId;
        var endpointKey = config.luis.endPointKey;
        var queryParams = {
            "verbose": true,
            "q": utterance,
            "subscription-key": endpointKey
        };
        var luisRequest = endpoint + luisAppId +
            '?' + querystring.stringify(queryParams);
        return new Promise((resolve, reject) => {
            try {
                request(luisRequest, function (err, response, body) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        var data = JSON.parse(body);
                        resolve(data);
                    }
                });
            }
            catch (err) {
                console.log(err + "happend while hitting luis");
            }
        });
    }
    createApativeCard(context, cardBody, usageDate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield context.sendActivity({
                text: `Your usage details shown from ${usageDate}`,
                attachments: [botbuilder_1.CardFactory.adaptiveCard({
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "version": "1.0",
                        "type": "AdaptiveCard",
                        "speak": "Showing usage details",
                        "body": cardBody,
                    })]
            });
        });
    }
    onTurn(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let intent = "";
            let filterData = {};
            let getLuisData = {};
            let usageCost = {};
            let resources;
            let billingDates;
            let filter;
            let cardBody;
            let dialogControl = yield this.dialogs.createContext(context);
            console.log("inside onturn", context.activity.text);
            yield dialogControl.continueDialog();
            console.log("After continue dialog");
            if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
                if (context.activity.text === "logout") {
                    userLoginToken = null;
                    config.userDetails.subscriptionId = null;
                    let botAdapter = context.adapter;
                    yield botAdapter.signOutUser(context, connection);
                    yield context.sendActivity('You have been signed out.');
                }
                console.log("inside msg");
                console.log("dialog msg", context.responded);
                if (!context.responded) {
                    getLuisData = yield this.getLuisIntent(context.activity.text);
                    let score = getLuisData['topScoringIntent']['score'];
                    console.log(score);
                    if (score > 0.7)
                        intent = getLuisData['topScoringIntent']['intent'];
                    else
                        intent = null;
                    switch (intent) {
                        case greeting:
                            yield context.sendActivity("Welcome");
                            break;
                        case cost:
                            filterData = FilterTheLuis_1.FilterForLuisData(getLuisData);
                            console.log(filterData);
                            filter = yield this.filterForPrompt.get(context, {});
                            filter.filterData = filterData;
                            yield this.filterForPrompt.set(context, filter);
                            if (filterData['resources'] === null) {
                                yield dialogControl.beginDialog(promptForResource);
                                break;
                            }
                            else {
                                if (filterData['resources'] === "resourceGroup")
                                    resources = "resourceGroup";
                                else
                                    resources = "resourceType";
                                usageCost = yield callapi_1.callApi(filterData);
                                let tempCost = yield this.userCost.get(context, {});
                                tempCost.cost = usageCost;
                                yield this.userCost.set(context, tempCost);
                                if (usageCost['resourceGroup']['keys'].length > 0) {
                                    let cardBody = adaptiveCardObject.AdaptiveCardForResources(usageCost['resourceGroup'], resources, usageCost['resourceGroup']['keys'].length);
                                    yield this.createApativeCard(context, cardBody, usageCost['resourceGroup']['usageDate']);
                                    yield dialogControl.beginDialog(breakDownForCost);
                                }
                                else
                                    yield context.sendActivity('sorry data was not found or it may not even crossed a rupee!!');
                            }
                            break;
                        case breakDown:
                            filterData = FilterTheLuis_1.FilterForLuisData(getLuisData);
                            console.log(filterData);
                            filter = yield this.filterForPrompt.get(context, {});
                            filter.filterData = filterData;
                            yield this.filterForPrompt.set(context, filter);
                            if (filterData['breakDown'] === null) {
                                yield dialogControl.beginDialog(promptForBreakDown);
                                break;
                            }
                            if (filterData['queryBy'] === "billingPeriod") {
                                billingDates = yield callapi_1.callApi(filterData);
                                if (billingDates) {
                                    billingDates = billingDates.split('to');
                                    filterData['queryBy'] = "userChoice";
                                    filterData['dateRange'] = `${billingDates[0]} to ${billingDates[1]}`;
                                }
                                else {
                                    yield context.sendActivity('No data was found');
                                    break;
                                }
                            }
                            if (filterData['queryBy'] === "userChoice") {
                                usageCost = yield callapi_1.callApi(filterData);
                                if (filterData['breakDown'] === "dates")
                                    cardBody = adaptiveCardObject.DatesBreakdown(usageCost);
                                else if (filterData['breakDown'] === "resourceType")
                                    cardBody = adaptiveCardObject.resourcetypeData(usageCost);
                                yield this.createApativeCard(context, cardBody, usageCost['usageDate']);
                            }
                            break;
                        case trend:
                            filterData = FilterTheLuis_1.FilterForLuisData(getLuisData);
                            console.log(filterData);
                            usageCost = yield callapi_1.callApi(filterData);
                            console.log(usageCost);
                            if (usageCost['currentKeys'].length > 0) {
                                if (usageCost['current'][usageCost['currentKeys'][0]] >= 1) {
                                    let cardBody = adaptiveCardObject.adaptiveCardForTrend(usageCost, usageCost['currentKeys']);
                                    yield context.sendActivity(`The current usage shown from ${usageCost['currentDate']}`);
                                    yield this.createApativeCard(context, cardBody, usageCost['oldDate']);
                                }
                                else
                                    yield context.sendActivity("Your usage cost does not crossed even a rupee");
                            }
                            else
                                yield context.sendActivity("No data was found");
                            break;
                        case billingPeriod:
                            filterData = FilterTheLuis_1.FilterForLuisData(getLuisData);
                            console.log(filterData);
                            billingDates = yield callapi_1.callApi(filterData);
                            yield context.sendActivity("Here is your top 5 billing period dates");
                            yield context.sendActivity({ attachments: [heroCardObject.HeroCardForBillingPeriod(billingDates)] });
                            break;
                        default:
                            yield context.sendActivity("Apologies. I dont't understand");
                            break;
                    }
                }
            }
            else if (context.activity.type === botbuilder_1.ActivityTypes.ConversationUpdate &&
                context.activity.recipient.id !== context.activity.membersAdded[0].id) {
                yield context.sendActivity('hai');
                if (userLoginToken === "dfs") {
                    yield dialogControl.beginDialog(AUTH_DIALOG);
                    console.log("dialog called");
                }
                else {
                    yield dialogControl.beginDialog(welcomeMessage);
                }
            }
            else {
                console.log("No match success");
            }
            yield this.conversationState.saveChanges(context);
            yield this.userState.saveChanges(context);
            console.log("saved");
        });
    }
}
exports.AzureUsageBot = AzureUsageBot;
