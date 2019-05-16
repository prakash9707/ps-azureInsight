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
const GetLuisIntent_1 = require("./GetLuisIntent");
const FilterTheLuis_1 = require("../Services/FilterTheLuis");
const callapi_1 = require("../Services/callapi");
const jwtDecode = require("jwt-decode");
const AdaptiveCard_1 = require("./AdaptiveCard");
const HeroCard_1 = require("./HeroCard");
const azuresubs_1 = require("../Services/azuresubs");
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
const subcriptionDialog = 'subscriptionDialog';
const azuresubs = new azuresubs_1.AzureUsageDetails();
const AUTH_DIALOG = 'auth_dialog';
const DATE_TIME_DIALOG = 'date_time_dialog';
const connection = 'azure';
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
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(subcriptionDialog, [
            this.askForSubcription.bind(this),
            this.captureSubscription.bind(this)
        ]));
    }
    askForSubcription(step) {
        return __awaiter(this, void 0, void 0, function* () {
            let subscriptionList = [];
            let azureSubscription = yield azuresubs.getAzureUsageDetails('https://management.azure.com/subscriptions?api-version=2016-06-01', this.userToken);
            let totalSubscription = azureSubscription['value'].length;
            if (totalSubscription === 0) {
                yield step.context.sendActivity('You do not have any active subscription');
                yield step.context.sendActivity('Without any active subscription you are not able to proceed further');
                config.userDetails.userToken = null;
                let botAdapter = step.context.adapter;
                yield botAdapter.signOutUser(step.context, connection);
                return yield step.endDialog();
            }
            for (let idx = 0; idx < totalSubscription; idx++) {
                subscriptionList.push({ "subscriptionId": azureSubscription['value'][idx].subscriptionId, "subscriptionName": azureSubscription['value'][idx].displayName });
            }
            yield step.context.sendActivity(`Please select any one subscription`);
            yield step.context.sendActivity({ attachments: [heroCardObject.HeroCardForSubscriptionId(subscriptionList)] });
        });
    }
    captureSubscription(step) {
        return __awaiter(this, void 0, void 0, function* () {
            config.userDetails.subscriptionId = step.result;
            let dialogControl = yield this.dialogs.createContext(step.context);
            yield dialogControl.beginDialog(welcomeMessage);
        });
    }
    oauthPrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield step.prompt(OAUTH_PROMPT);
        });
    }
    loginResults(step) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("loginResults");
            let tokenResponse = step.result;
            if (tokenResponse) {
                this.userToken = tokenResponse['token'];
                const claims = jwtDecode(tokenResponse['token']);
                config.userDetails.userToken = tokenResponse['token'];
                yield step.context.sendActivity('You are now logged in sucessfully.');
                yield step.context.sendActivity(`Hi ${claims['name']}`);
                let dialogControl = yield this.dialogs.createContext(step.context);
                yield dialogControl.beginDialog(subcriptionDialog);
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
                const dialogControl = yield this.dialogs.createContext(step.context);
                let filter = yield this.filterForPrompt.get(step.context, {});
                filter['filterData'].resources = step.result.value;
                console.log(filter['filterData']);
                let usageCost = yield callapi_1.callApi(filter['filterData'], this.userToken);
                if (usageCost.hasOwnProperty('error')) {
                    this.userToken = null;
                    yield step.context.sendActivity("Your token was expired");
                    yield dialogControl.beginDialog(AUTH_DIALOG);
                }
                else {
                    let tempCost = yield this.userCost.get(step.context, {});
                    tempCost.cost = usageCost;
                    console.log("usagecost", usageCost);
                    yield this.userCost.set(step.context, tempCost);
                    if (step.result.value === "resourceGroup") {
                        if (usageCost['resourceGroup']['keys'].length > 0) {
                            let cardBody = adaptiveCardObject.AdaptiveCardForResources(usageCost['resourceGroup'], filter['filterData'].resources, usageCost['resourceGroup']['keys'].length);
                            yield this.createApativeCard(step.context, cardBody, usageCost['resourceGroup']['usageDate']);
                            yield dialogControl.beginDialog(breakDownForCost);
                        }
                        else
                            yield step.context.sendActivity('Sorry no matched data was found or it may not cross even a rupee');
                    }
                    else {
                        if (usageCost['keys'].length > 0) {
                            let cardBody = adaptiveCardObject.AdaptiveCardForResources(usageCost, filter['filterData'].resources, usageCost['keys'].length);
                            yield this.createApativeCard(step.context, cardBody, usageCost['usageDate']);
                        }
                        else
                            yield step.context.sendActivity('Sorry no matched data was found or it may not cross even a rupee');
                    }
                }
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
            const dialogControl = yield this.dialogs.createContext(step.context);
            if (step.result.value === "dates") {
                let filter = yield this.filterForPrompt.get(step.context, {});
                filter['filterData'].breakDown = step.result.value;
                console.log(filter['filterData']);
                let usageCost;
                if (filter['filterData']['queryBy'] === "billingPeriod") {
                    usageCost = yield callapi_1.callApi(filter['filterData'], this.userToken);
                    if (usageCost.hasOwnProperty('error')) {
                        yield step.context.sendActivity("Your token was expired");
                        this.userToken = null;
                        yield dialogControl.beginDialog(AUTH_DIALOG);
                    }
                    else {
                        console.log("dates ", usageCost);
                        let cardBody = adaptiveCardObject.DatesBreakdown(usageCost);
                        yield this.createApativeCard(step.context, cardBody, usageCost['usageDate']);
                    }
                }
            }
            else {
                let filter = yield this.filterForPrompt.get(step.context, {});
                filter['filterData'].breakDown = step.result.value;
                console.log(filter['filterData']);
                let usageCost;
                if (filter['filterData']['queryBy'] === "billingPeriod") {
                    usageCost = yield callapi_1.callApi(filter['filterData'], this.userToken);
                    if (usageCost.hasOwnProperty('error')) {
                        yield step.context.sendActivity("Your token was expired");
                        this.userToken = null;
                        yield dialogControl.beginDialog(AUTH_DIALOG);
                    }
                    else {
                        console.log("resource type data ", usageCost);
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
                if (this.userToken === null)
                    yield dialogControl.beginDialog(AUTH_DIALOG);
                if (context.activity.text === "logout") {
                    this.userToken = null;
                    config.userDetails.subscriptionId = null;
                    let botAdapter = context.adapter;
                    yield botAdapter.signOutUser(context, connection);
                    yield context.sendActivity('You have been signed out.');
                }
                console.log("inside msg");
                console.log("dialog msg", context.responded);
                if (!context.responded) {
                    getLuisData = yield GetLuisIntent_1.getLuisIntent(context.activity.text);
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
                            console.log("initial ", filter);
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
                                usageCost = yield callapi_1.callApi(filterData, this.userToken);
                                if (usageCost.hasOwnProperty('error')) {
                                    yield context.sendActivity("Your token was expired");
                                    yield dialogControl.beginDialog(AUTH_DIALOG);
                                }
                                else {
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
                            }
                            break;
                        case breakDown:
                            filterData = FilterTheLuis_1.FilterForLuisData(getLuisData);
                            filter = yield this.filterForPrompt.get(context, {});
                            filter.filterData = filterData;
                            yield this.filterForPrompt.set(context, filter);
                            if (filterData['breakDown'] === null) {
                                yield dialogControl.beginDialog(promptForBreakDown);
                                break;
                            }
                            usageCost = yield callapi_1.callApi(filterData, this.userToken);
                            if (usageCost.hasOwnProperty('error')) {
                                yield context.sendActivity("Your token was expired");
                                yield dialogControl.beginDialog(AUTH_DIALOG);
                            }
                            else {
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
                            usageCost = yield callapi_1.callApi(filterData, this.userToken);
                            if (usageCost.hasOwnProperty('error')) {
                                yield context.sendActivity("Your token was expired");
                                yield dialogControl.beginDialog(AUTH_DIALOG);
                            }
                            else {
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
                            }
                            break;
                        case billingPeriod:
                            filterData = FilterTheLuis_1.FilterForLuisData(getLuisData);
                            console.log(filterData);
                            usageCost = yield callapi_1.callApi(filterData, this.userToken);
                            if (billingDates.hasOwnProperty('error')) {
                                yield context.sendActivity("Your token was expired");
                                yield dialogControl.beginDialog(AUTH_DIALOG);
                            }
                            yield context.sendActivity("Here is your recent billing period dates");
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
                if (this.userToken === null) {
                    yield dialogControl.beginDialog(AUTH_DIALOG);
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
