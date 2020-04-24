// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MemoryStorage, MessageFactory } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');


var storage = new MemoryStorage();

class MyBot extends ActivityHandler {
    constructor(configuration, qnaOptions, conversationState, userState, dialog, qnaDialog, qnaCoversationState, qnaUserState) {
       super();
       if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');
       // now create a qnaMaker connector. **leave out for now
        this.qnaMaker = new QnAMaker(configuration, qnaOptions);

        this.qnaMakerOptions = {
            scoreThreshold: 0.3,
            top: 3,
            context: {},
            qnaId: -1
        };
        // The state management objects for the conversation and user.
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');


        // this.conversationState = conversationState;
        // this.userState = userState;
        this.qnaCoversationState = qnaCoversationState;
        this.qnaUserState = qnaUserState;
        this.qnaDialog = qnaDialog;
        this.qnaDialogState = this.qnaCoversationState.createProperty('DialogState');
        

        this.waterfall = false;

        this.onMessage(async (context, next) => {
            // if (this.dialogState) {
            //     console.log('yes');
            // } else {
            //     console.log('nah');
            // }
            // send user input to QnA Maker.

            

        //  THE STUFF FOR THE WATERFALLA
            // console.log(this.dialogState);
            // console.log("hmm = " + this.dialog.active);
            console.log(this.dialog.active);
            if (this.dialog.active == true){
                await this.dialog.run(context, this.dialogState);
            } else {
                // await context.sendActivity('prentend this is qna response');

                await this.qnaDialog.run(context, this.qnaDialogState);
//*QNA, LEAVE OUT FOR NOW
        //     const qnaResults = await this.qnaMaker.getAnswersRaw(context,this.qnaMakerOptions);
            
        //  // If an answer was received from QnA Maker, send the answer back to the user.
        //     if (qnaResults.answers.length > 0) {
        //         await context.sendActivity(` ${ qnaResults.answers[0]}`);
        //     }
        //     else {
        //         // If no answers were returned from QnA Maker, reply with help.
        //         await context.sendActivity('No QnA Maker response was returned.'
        //             + 'This example uses a QnA Maker Knowledge Base that focuses on smart light bulbs. '
        //             + `Ask the bot questions like "Why won't it turn on?" or "I need help."`);
        //     }
            }
            
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                    // await this.sendSuggestedActions(context);
                    if (this.dialogState) {
                        console.log('yes1');
                    } else {
                        console.log('nah1');
                    }
                    await this.dialog.run(context, this.dialogState);
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        
    }

    async sendSuggestedActions(turnContext) {

        // const flow = await this.conversationFlow.get(turnContext, { lastQuestionAsked: question.none });
        // const profile = await this.userProfile.get(turnContext, {});

        // await MyBot.addEmail(flow, profile, turnContext);

        // By calling next() you ensure that the next BotHandler is run.
        // await next();


        var reply = MessageFactory.suggestedActions(['No', 'Yes '], 'What is the best color?');
        console.log(reply);
        await turnContext.sendActivity(reply);
       
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

    // Manages the conversation flow for filling out the user's profile.
    static async addEmail(flow, profile, turnContext) {
        const input = turnContext.activity.text;
        let result;
        switch (flow.lastQuestionAsked) {
        // If we're just starting off, we haven't asked the user for any information yet.
        // Ask the user for their name and update the conversation flag.
        case question.none:
            await turnContext.sendActivity("Let's get started. What is your name?");
            flow.lastQuestionAsked = question.name;
            break;

        // If we last asked for their name, record their response, confirm that we got it.
        // Ask them for their age and update the conversation flag.
        case question.name:
            result = this.validateName(input);
            if (result.success) {
                profile.name = result.name;
                await turnContext.sendActivity(`I have your name as ${ profile.name }.`);
                await turnContext.sendActivity('How old are you?');
                flow.lastQuestionAsked = question.age;
                break;
            } else {
                // If we couldn't interpret their input, ask them for it again.
                // Don't update the conversation flag, so that we repeat this step.
                await turnContext.sendActivity(result.message || "I'm sorry, I didn't understand that.");
                break;
            }

        // If we last asked for their age, record their response, confirm that we got it.
        // Ask them for their date preference and update the conversation flag.
        case question.age:
            result = this.validateAge(input);
            if (result.success) {
                profile.age = result.age;
                await turnContext.sendActivity(`I have your age as ${ profile.age }.`);
                await turnContext.sendActivity('When is your flight?');
                flow.lastQuestionAsked = question.date;
                break;
            } else {
                // If we couldn't interpret their input, ask them for it again.
                // Don't update the conversation flag, so that we repeat this step.
                await turnContext.sendActivity(result.message || "I'm sorry, I didn't understand that.");
                break;
            }

        // If we last asked for a date, record their response, confirm that we got it,
        // let them know the process is complete, and update the conversation flag.
        case question.date:
            result = this.validateDate(input);
            if (result.success) {
                profile.date = result.date;
                await turnContext.sendActivity(`Your cab ride to the airport is scheduled for ${ profile.date }.`);
                await turnContext.sendActivity(`Thanks for completing the booking ${ profile.name }.`);
                await turnContext.sendActivity('Type anything to run the bot again.');
                flow.lastQuestionAsked = question.none;
                profile = {};
                break;
            } else {
                // If we couldn't interpret their input, ask them for it again.
                // Don't update the conversation flag, so that we repeat this step.
                await turnContext.sendActivity(result.message || "I'm sorry, I didn't understand that.");
                break;
            }
        }
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
