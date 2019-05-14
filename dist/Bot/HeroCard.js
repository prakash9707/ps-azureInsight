"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
class HeroCard {
    HeroCardForBillingPeriod(result) {
        let cardArray = [];
        for (let idx = 0; idx < result.length; idx++) {
            cardArray.push({
                "type": "imBack",
                "title": result[idx],
                "value": `Cost for ${result[idx]}`
            });
        }
        return botbuilder_1.CardFactory.heroCard('', botbuilder_1.CardFactory.images(['']), botbuilder_1.CardFactory.actions(cardArray));
    }
    HeroCardForSubscriptionId(result) {
        let cardArray = [];
        console.log(result);
        for (let idx = 0; idx < result.length; idx++) {
            cardArray.push({
                "type": "imBack",
                "title": result[idx]['subscriptionName'],
                "value": result[idx]['subscriptionId']
            });
        }
        return botbuilder_1.CardFactory.heroCard('', botbuilder_1.CardFactory.images(['']), botbuilder_1.CardFactory.actions(cardArray));
    }
    HeroCardForWelcomeMessage() {
        return botbuilder_1.CardFactory.heroCard('Welcome to Azure Cost Bot', botbuilder_1.CardFactory.images(['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Microsoft_Azure_Logo.svg/2000px-Microsoft_Azure_Logo.svg.png']), botbuilder_1.CardFactory.actions([
            {
                type: 'openUrl',
                title: 'Login',
                value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
            }
        ]));
    }
    HeroCardForChart(base64ForImage, imageType = 'jpg') {
        return botbuilder_1.CardFactory.heroCard('', botbuilder_1.CardFactory.images([`data:image/${imageType};base64,${base64ForImage}`, 'http://localhost:3978/chart.jpg']), botbuilder_1.CardFactory.actions([]));
    }
}
exports.HeroCard = HeroCard;
