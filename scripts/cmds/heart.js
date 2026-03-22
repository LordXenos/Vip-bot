module.exports = {
    config: {
        name: 'heart',
        aliases: [],
        version: '1.0',
        author: 'Rasin',
        prefix: true,
        description: 'React with ❤️‍🩹',
        usages: '!heart (reply to message)',
        countDown: 3,
        role: 0,
        category: 'react'
    },
    onStart: async function ({ message, event, api }) {
        if (!event.messageReply) return message.reply('Reply to a message first.');
        api.setMessageReaction('❤️‍🩹', event.messageReply.messageID, (err) => {
            if (err) return message.reply('❌ Failed to react.');
        }, true);
    }
};