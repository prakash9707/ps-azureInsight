import { CardFactory, Attachment } from "botbuilder";
export class HeroCard{

    HeroCardForBillingPeriod(result: any): Attachment {
        let cardArray: Array<any> = [];
        for (let idx: number = 0; idx < result.length; idx++) {
            cardArray.push({
                "type": "imBack",
                "title": result[idx],
                "value": `Cost for ${result[idx]}`
            });
        }
        return CardFactory.heroCard(
            '',
            CardFactory.images(['']),
            CardFactory.actions(cardArray)
        );
    }

    HeroCardForWelcomeMessage() : Attachment {
        return CardFactory.heroCard(
            'Welcome to Azure Cost Bot',
            CardFactory.images(['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Microsoft_Azure_Logo.svg/2000px-Microsoft_Azure_Logo.svg.png']),
            CardFactory.actions([
                {
                    type: 'openUrl',
                    title: 'Login',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
                }
            ])
        );
    }

    HeroCardForChart(base64ForImage: object, imageType: string = 'jpg'): Attachment {
        return CardFactory.heroCard(
            '',
            CardFactory.images([`data:image/${imageType};base64,${base64ForImage}`, 'http://localhost:3978/chart.jpg']),
            CardFactory.actions([])
        );
    }
}