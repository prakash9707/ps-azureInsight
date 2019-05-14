import { TurnContext, ActivityTypes, CardFactory, ConversationState, UserState, BotFrameworkAdapter } from "botbuilder";
import { ChoicePrompt, DialogSet, WaterfallDialog, OAuthPrompt, DateTimePrompt, ConfirmPrompt } from "botbuilder-dialogs";
import * as request from "request";
import * as querystring from "querystring";
import { FilterForLuisData } from "../API/FilterTheLuis";
import { callApi } from "../API/callapi";
// import { designChartWithAzureData } from "./Chart";
import * as jwtDecode from 'jwt-decode';
import { AdaptiveCard } from "./AdaptiveCard";
import { HeroCard } from "./HeroCard";
import { AzureUsageDetails } from "../API/azuresubs";
import { userAgentPolicy } from "@azure/ms-rest-js";





const dialogStateProperty: string = "dialogStateProperty";
const confirmPrompt: string = "confirmPrompt";
const config: any = require('../../config/default.json');
const welcomeMessage: string = "welcomeMessage";
const cost: string = "cost";
const trend: string = "trend";
const breakDown: string = "breakDown";
const greeting: string = "greeting";
const promptForResource: string = "promptForResource";
const promptForBreakDown: string = "promptForBreakDown";
const breakDownForCost: string = "breakDownForCost";
const billingPeriod: string = "billingPeriod";
const heroCardObject: HeroCard = new HeroCard();
const adaptiveCardObject: AdaptiveCard = new AdaptiveCard();
const OAUTH_PROMPT = 'oAuth_prompt';
const subcriptionDialog = 'subscriptionDialog';
const azuresubs: AzureUsageDetails = new AzureUsageDetails();



// Name of the WaterfallDialog the bot uses.
const AUTH_DIALOG = 'auth_dialog';

// Name of the WaterfallDialog the bot uses.
const DATE_TIME_DIALOG = 'date_time_dialog';
const connection = 'azure';

// Create the settings for the OAuthPrompt.
const OAUTH_SETTINGS = {
    connectionName: connection,
    title: 'Log In',
    text: 'Please Log In',
    timeout: 300000 // User has 5 minutes to log in.
};


export class AzureUsageBot {
    conversationState: any;
    userState: any;
    dialogs: any;
    dialogState: any;
    filterForPrompt: any;
    userCost: any;


    constructor(conversationState: ConversationState, userState: UserState) {
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = this.conversationState.createProperty(dialogStateProperty);
        this.filterForPrompt = this.userState.createProperty("createFilter");
        this.userCost = this.userState.createProperty("userCost");
        //  this.userLoginToken = this.userState.createProperty("userLogin");

        this.dialogs = new DialogSet(this.dialogState);

        this.dialogs.add(new ChoicePrompt(confirmPrompt));



        this.dialogs.add(new WaterfallDialog(welcomeMessage, [
            this.askForStart.bind(this),
        ]));

        this.dialogs.add(new WaterfallDialog(promptForResource, [
            this.askForResource.bind(this),
            this.getResource.bind(this)
        ]));

        this.dialogs.add(new WaterfallDialog(promptForBreakDown, [
            this.askForBreakDown.bind(this),
            this.getBreakDown.bind(this)
        ]));

        this.dialogs.add(new WaterfallDialog(breakDownForCost, [
            this.askForBreakDownChoice.bind(this),
            this.getDataForBreakDown.bind(this)
        ]));

        this.dialogs.add(new OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));

        this.dialogs.add(new DateTimePrompt(DATE_TIME_DIALOG));


        // The WaterfallDialog that controls the flow of the conversation.
        this.dialogs.add(new WaterfallDialog(AUTH_DIALOG, [
            this.oauthPrompt.bind(this),
            this.loginResults.bind(this)
        ]));

        this.dialogs.add(new WaterfallDialog(subcriptionDialog, [
            this.askForSubcription.bind(this),
            this.captureSubscription.bind(this)

        ]));

    }

    /**
     * Waterfall step that prompts the user to login if they have not already or their token has expired.
     * @param {WaterfallStepContext} step
     */

    async askForSubcription(step: any) {
        let subscriptionList = [];
        let azureSubscription = await azuresubs.getAzureUsageDetails('https://management.azure.com/subscriptions?api-version=2016-06-01');
        let totalSubscription : number = azureSubscription['value'].length;
        if (totalSubscription === 0){
            await step.context.sendActivity('You do not have any active subscription');
            await step.context.sendActivity('Without any active subscription you are not able to proceed further');
            config.userDetails.userToken = null;
            let botAdapter : BotFrameworkAdapter = <BotFrameworkAdapter>step.context.adapter;
            await botAdapter.signOutUser(step.context, connection);
            return await step.endDialog();
        }
        for (let idx: number = 0; idx < totalSubscription; idx++) {
            subscriptionList.push({ "subscriptionId": azureSubscription['value'][idx].subscriptionId, "subscriptionName": azureSubscription['value'][idx].displayName });
        }
        await step.context.sendActivity(`Please select any one subscription`);
        await step.context.sendActivity({ attachments: [heroCardObject.HeroCardForSubscriptionId(subscriptionList)] });
    }
    async captureSubscription(step: any) {
        config.userDetails.subscriptionId = step.result.value;
        let dialogControl: any = await this.dialogs.createContext(step.context);
        await dialogControl.beginDialog(welcomeMessage);
        
    }
    async oauthPrompt(step: any) {
        console.log("coming");
        return await step.prompt(OAUTH_PROMPT);
    }

    /**
     * Waterfall step that informs the user that they are logged in and asks
     * the user if they would like to see their token via a prompt
     * @param {WaterfallStepContext} step
     */
    async loginResults(step: any) {
        console.log("loginResults");

        let tokenResponse = step.result;
        console.log(tokenResponse);
        if (tokenResponse) {
            /**
             * With this token response get the user details with microsoft graph api
             * After collecting the user detail give the message to the bot
             * Then check with the database to know whether the user is valid or not
             */
            const claims: any = jwtDecode(tokenResponse['token']);
            config.userDetails.userToken = tokenResponse['token'];
            await step.context.sendActivity('You are now logged in sucessfully.');
            await step.context.sendActivity(`Hi ${claims['email']}`);
            let dialogControl: any = await this.dialogs.createContext(step.context);
            await dialogControl.beginDialog(subcriptionDialog);



        }
    }

    async askForStart(step: any) {

        await step.prompt(confirmPrompt, 'Do you want to see your details by ?', ["Cost", "Trend", "Break Down", "Billing Period"]);
        return await step.endDialog();
    }

    async askForResource(step: any) {
        await step.prompt(confirmPrompt, 'Do you want to see your details by ?', ["resourceGroup", "resourceType"]);
    }

    async getResource(step: any) {
        if (step.result && step.result.value) {
            const dialogControl = await this.dialogs.createContext(step.context);
            let filter: any = await this.filterForPrompt.get(step.context, {});
            filter['filterData'].resources = step.result.value;
            console.log(filter['filterData']);
            // if (filter['filterData']['queryBy'] === "billingPeriod") {
            //     billingDates = await callApi(filter['filterData']);
            //     if (billingDates) {
            //         billingDates = billingDates.split('to');
            //         filter['filterData']['queryBy'] = "userChoice";
            //         filter['filterData']['dateRange'] = ${billingDates[0]} to ${billingDates[1]};
            //     }
            //     else {
            //         await step.context.sendActivity('No data was found');
            //     }
            // }
            let usageCost: any = await callApi(filter['filterData']);
            if (usageCost.hasOwnProperty('error')) {
                config.userDetails.userToken = null;
                await step.context.sendActivity("Your token was expired");
                await dialogControl.beginDialog(AUTH_DIALOG);
            }
            else {
                let tempCost = await this.userCost.get(step.context, {});
                tempCost.cost = usageCost;
                console.log("usagecost",usageCost);
                await this.userCost.set(step.context, tempCost);
                if (step.result.value === "resourceGroup"){
                if (usageCost['resourceGroup']['keys'].length > 0) {

                    let cardBody: JSON = adaptiveCardObject.AdaptiveCardForResources(usageCost['resourceGroup'], filter['filterData'].resources, usageCost['resourceGroup']['keys'].length);
                    await this.createApativeCard(step.context, cardBody, usageCost['resourceGroup']['usageDate']);

                    await dialogControl.beginDialog(breakDownForCost);
                }
                else
                    await step.context.sendActivity('Sorry no matched data was found or it may not cross even a rupee');
            }
        
        else{
            if (usageCost['keys'].length > 0){
                let cardBody: JSON = adaptiveCardObject.AdaptiveCardForResources(usageCost, filter['filterData'].resources, usageCost['keys'].length);
                await this.createApativeCard(step.context, cardBody, usageCost['usageDate']);
            }
            else
                    await step.context.sendActivity('Sorry no matched data was found or it may not cross even a rupee');
        

        }
    }
        }

    }

    async askForBreakDown(step: any) {
        await step.prompt(confirmPrompt, 'Do you want to break down by', ["dates", "resourceType"]);
    }

    async getBreakDown(step: any) {
        if (step.result.value === "Dates") {
            let filter: any = await this.filterForPrompt.get(step.context, {});
            filter['filterData'].breakDown = step.result.value;
            console.log(filter['filterData']);
            let usageCost: any;
            if (filter['filterData']['queryBy'] === "billingPeriod") {
                usageCost = await callApi(filter['filterData']);
                console.log("dates ",usageCost);
                let cardBody: JSON = adaptiveCardObject.DatesBreakdown(usageCost);
                await this.createApativeCard(step.context, cardBody, usageCost['usageDate']);     
            }
        }
        else{
            let filter: any = await this.filterForPrompt.get(step.context, {});
            filter['filterData'].breakDown = step.result.value;
            console.log(filter['filterData']);
            let usageCost: any;
            if (filter['filterData']['queryBy'] === "billingPeriod") {
                usageCost = await callApi(filter['filterData']);
                console.log("resource type data ",usageCost);
                let cardBody: JSON = adaptiveCardObject.resourcetypeData(usageCost);
                await this.createApativeCard(step.context, cardBody, usageCost['usageDate']);     
            }
        }
    }

    async askForBreakDownChoice(step: any) {
        await step.prompt(confirmPrompt, 'Do you want to break down by', ["Dates", "ResourceType", "Display Chart", "no thanks"]);
    }

    async getDataForBreakDown(step: any) {
        let usageCost: any = await this.userCost.get(step.context, {});
        if (step.result) {
            if (step.result.value === "Dates") {
                //console.log(usageCost['dates']);
                let cardBody: JSON = adaptiveCardObject.DatesBreakdown(usageCost['cost']['dates']);
                await this.createApativeCard(step.context, cardBody, usageCost['cost']['dates']['usageDate']);
            }
            else if (step.result.value === "ResourceType") {
                let cardBody: JSON = adaptiveCardObject.resourcetypeData(usageCost['cost']['resourceType']);
                await this.createApativeCard(step.context, cardBody, usageCost['cost']['resourceType']['usageDate']);

            }
            else if (step.result.value === "Display Chart") {
                // let base64ForImage: object = await (designChartWithAzureData(usageCost['cost']['resource']));
                // await step.context.sendActivity({ attachments: [heroCardObject.HeroCardForChart(base64ForImage)] });
                await step.context.sendActivity("Currently not available");
            }
            else if (step.result.value === "no thanks") {
                await step.context.sendActivity("Fine, If you have any question let me know");
            }
        }
        return await step.endDialog();
    }


    getLuisIntent(utterance: string): object {
        var endpoint = config.luis.endPoint;
        var luisAppId = config.luis.luisAppId;
        var endpointKey = config.luis.endPointKey;
        var queryParams = {
            "verbose": true,
            "q": utterance,
            "subscription-key": endpointKey
        }
        var luisRequest =
            endpoint + luisAppId +
            '?' + querystring.stringify(queryParams);
        return new Promise((resolve, reject) => {
            try {
                request(luisRequest, function (err: any,
                    response: any, body: any) {
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



    async createApativeCard(context: any, cardBody: any, usageDate: string) {
        await context.sendActivity({
            text: `Your usage details shown from ${usageDate}`,
            attachments: [CardFactory.adaptiveCard({
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "1.0",
                "type": "AdaptiveCard",
                "speak": "Showing usage details",
                "body": cardBody,
            })]
        });

    }



    async onTurn(context: TurnContext) {



        // await context.sendActivity('working');
        let intent: string = "";
        let filterData: any = {};
        let getLuisData: any = {};
        let usageCost: any = {};
        let resources: string;
        let billingDates: any;
        let filter: any;
        let cardBody: any;
        let dialogControl: any = await this.dialogs.createContext(context);
        console.log("inside onturn", context.activity.text);

        await dialogControl.continueDialog();

        console.log("After continue dialog");
        if (context.activity.type === ActivityTypes.Message) {
            if (config.userDetails.userToken === null) {
                await dialogControl.beginDialog(AUTH_DIALOG);
            }
            // if (config.userDetails.subscriptionId === null)
            //     await dialogControl.beginDialog(subcriptionDialog);

            if (context.activity.text === "logout") {
                config.userDetails.userToken = null;
                config.userDetails.subscriptionId = null;
                let botAdapter: BotFrameworkAdapter = <BotFrameworkAdapter>context.adapter;
                await botAdapter.signOutUser(context, connection);
                await context.sendActivity('You have been signed out.');
                await dialogControl.beginDialog(AUTH_DIALOG);
            }
            console.log("inside msg");
            console.log("dialog msg", context.responded);
            if (!context.responded) {
                getLuisData = await this.getLuisIntent(context.activity.text);
                let score: number = getLuisData['topScoringIntent']['score'];
                console.log(score);
                if (score > 0.7)
                    intent = getLuisData['topScoringIntent']['intent'];
                else
                    intent = null;




                switch (intent) {
                    case greeting:
                        await context.sendActivity("Welcome");
                        break;
                    case cost:
                        filterData = FilterForLuisData(getLuisData);
                        console.log(filterData);
                        filter = await this.filterForPrompt.get(context, {});
                        filter.filterData = filterData;
                        await this.filterForPrompt.set(context, filter);
                        if (filterData['resources'] === null) {
                            await dialogControl.beginDialog(promptForResource);
                            break;
                        }
                        else {
                            if (filterData['resources'] === "resourceGroup")
                                resources = "resourceGroup";
                            else
                                resources = "resourceType";
                            // if (filterData['queryBy'] === "billingPeriod") {
                            //     billingDates = await callApi(filterData);
                            //     if (billingDates) {
                            //         billingDates = billingDates.split('to');
                            //         filterData['queryBy'] = "userChoice";
                            //         filterData['dateRange'] = `${billingDates[0]} to ${billingDates[1]}`;
                            //     }
                            //     else {
                            //         await context.sendActivity('No data was found');
                            //         break;
                            //     }
                            // }
                            usageCost = await callApi(filterData);
                            if (usageCost.hasOwnProperty('error')) {
                                await context.sendActivity("Your token was expired");
                                config.userDetails.userToken = null;
                                await dialogControl.beginDialog(AUTH_DIALOG);
                            }
                            else {
                                let tempCost = await this.userCost.get(context, {});
                                tempCost.cost = usageCost;
                                await this.userCost.set(context, tempCost);
                                if (usageCost['resourceGroup']['keys'].length > 0) {
                                    let cardBody: JSON = adaptiveCardObject.AdaptiveCardForResources(usageCost['resourceGroup'], resources, usageCost['resourceGroup']['keys'].length);
                                    await this.createApativeCard(context, cardBody, usageCost['resourceGroup']['usageDate'])
                                    await dialogControl.beginDialog(breakDownForCost);
                                }
                                else
                                    await context.sendActivity('sorry data was not found or it may not even crossed a rupee!!');
                            }
                        }
                        break;
                    case breakDown:
                        filterData = FilterForLuisData(getLuisData);
                        filter = await this.filterForPrompt.get(context, {});
                        filter.filterData = filterData;
                        await this.filterForPrompt.set(context, filter);
                        if (filterData['breakDown'] === null) {
                            await dialogControl.beginDialog(promptForBreakDown);
                            break;
                        }
                        if (filterData['queryBy'] === "billingPeriod") {
                            usageCost = await callApi(filterData);
                        }
                        if (filterData['queryBy'] === "userChoice") {
                            usageCost = await callApi(filterData);
                        }
                            if (filterData['breakDown'] === "dates")
                                cardBody = adaptiveCardObject.DatesBreakdown(usageCost);
                            else if (filterData['breakDown'] === "resourceType")
                                cardBody = adaptiveCardObject.resourcetypeData(usageCost);
                            await this.createApativeCard(context, cardBody, usageCost['usageDate']);
                        break;
                    case trend:
                        filterData = FilterForLuisData(getLuisData);
                        console.log(filterData);
                        // if (filterData['queryBy'] === "billingPeriod") {
                        //     billingDates = await callApi(filterData);
                        //     if (billingDates) {
                        //         filterData['queryBy'] = "userChoice";
                        //         filterData['dateRange'] = `${billingDates.startDate} to ${billingDates.endDate}`;
                        //         filterData['midRange'] = billingDates.midDate;
                        //     }
                        //     else {
                        //         await context.sendActivity('No data was found');
                        //         break;
                        //     }
                        // }
                        usageCost = await callApi(filterData);
                        if (usageCost.hasOwnProperty('error')) {
                            await context.sendActivity("Your token was expired");
                            config.userDetails.userToken = null;
                            await dialogControl.beginDialog(AUTH_DIALOG);
                        }
                        else {
                            if (usageCost['currentKeys'].length > 0) {
                                if (usageCost['current'][usageCost['currentKeys'][0]] >= 1) {
                                    let cardBody: any = adaptiveCardObject.adaptiveCardForTrend(usageCost, usageCost['currentKeys']);
                                    await context.sendActivity(`The current usage shown from ${usageCost['currentDate']}`);
                                    await this.createApativeCard(context, cardBody, usageCost['oldDate']);
                                }
                                else
                                    await context.sendActivity("Your usage cost does not crossed even a rupee");
                            }
                            else
                                await context.sendActivity("No data was found");
                        }
                        break;
                    case billingPeriod:
                        filterData = FilterForLuisData(getLuisData);
                        console.log(filterData);
                        billingDates = await callApi(filterData);
                        if (billingDates.hasOwnProperty('error')) {
                            await context.sendActivity("Your token was expired");
                            config.userDetails.userToken = null;
                            await dialogControl.beginDialog(AUTH_DIALOG);
                        }
                        await context.sendActivity("Here is your top 5 billing period dates");
                        await context.sendActivity({ attachments: [heroCardObject.HeroCardForBillingPeriod(billingDates)] });
                        break;

                    default:
                        await context.sendActivity("Apologies. I dont't understand");
                        break;

                }
            }

        }
        else if (context.activity.type === ActivityTypes.ConversationUpdate &&
            context.activity.recipient.id !== context.activity.membersAdded[0].id) {
            await context.sendActivity('hai');
            if (config.userDetails.userToken === null) {
                await dialogControl.beginDialog(AUTH_DIALOG);
            }
            else {
                // await context.sendActivity({ attachments: [heroCardObject.HeroCardForWelcomeMessage()] });
                await dialogControl.beginDialog(welcomeMessage);
            }

        }
        else {
            console.log("No match success");

        }

        await this.conversationState.saveChanges(context);
        await this.userState.saveChanges(context);
        console.log("saved");

    }

}