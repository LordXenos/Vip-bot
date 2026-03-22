module.exports = {
    config: {
        name: 'react',
        version: '1.0',
        author: 'Rasin',
        prefix: true,
        description: 'React to a message',
        usages: '!react 👋🏻 (reply to a message)',
        countDown: 3,
        role: 0,
        category: 'utility'
    },

    onStart: async function ({ message, event, args, api }) {
        try {
            if (!event.messageReply) {
                return message.reply('Please reply to a message to react');
            }

            if (args.length === 0) {
                return message.reply('Please provide an emoji');
            }

            const messageID = event.messageReply.messageID;
            const emoji = args[0];

            api.setMessageReaction(emoji, messageID, (err) => {
                if (err) {
                    console.error(`Error reacting with ${emoji}:`, err);
                    return message.reply('❌ Failed to react with that emoji.');
                }
            }, true);

        } catch (error) {
            console.error('Error in react command:', error);
            message.reply('❌ An error occurred while reacting to the message.');
        }
    }
}