// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MemoryStorage } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');


var storage = new MemoryStorage();

class MyBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
       super();
       if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');
       // now create a qnaMaker connector.
        this.qnaMaker = new QnAMaker(configuration, qnaOptions);

        this.onMessage(async (context, next) => {
            // send user input to QnA Maker.
            const qnaResults = await this.qnaMaker.getAnswers(context);
            
         // If an answer was received from QnA Maker, send the answer back to the user.
            if (qnaResults[0]) {
                await context.sendActivity(` ${ qnaResults[0].answer}`);
            }
            else {
                // If no answers were returned from QnA Maker, reply with help.
                await context.sendActivity('No QnA Maker response was returned.'
                    + 'This example uses a QnA Maker Knowledge Base that focuses on smart light bulbs. '
                    + `Ask the bot questions like "Why won't it turn on?" or "I need help."`);
            }
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}


    



class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '${ context.activity.text }'`);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
module.exports.MyBot = MyBot
module.exports.EchoBot = EchoBot;
