let { AzureUsageBot } = require('./dist/Bot/Bot');
const path = require('path');
const restify = require('restify');
let { BotFrameworkAdapter, UserState, MemoryStorage, ConversationState } = require('botbuilder');


const { BotConfiguration } = require('botframework-config');
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const DEV_ENVIRONMENT = 'development';
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);


const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening on ${server.url}`);
});

const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));


//Read bot configuration from .bot file.
let botConfig;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.log(err);
    console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`);
    console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.`);
    console.error(`\n - See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.\n\n`);
    process.exit();
}

//Get bot endpoint configuration by service name
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION);

const adapter = new BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appId || process.env.MicrosoftAppPassword,
    // channelService: process.env.ChannelService,
    // openIdMetadata: process.env.BotOpenIdMetadata
    // appId : '',
    // appPassword : '',
});


adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.log(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    await context.sendActivity('Sorry, it looks like something went wrong!');
    // Clear out state
    await conversationState.delete(context);
    await userState.delete(context);
};



let conversationState = new ConversationState(new MemoryStorage());
// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.

let userState = new UserState(new MemoryStorage());
const azure = new AzureUsageBot(conversationState, userState);

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await azure.onTurn(context);
    });
});
