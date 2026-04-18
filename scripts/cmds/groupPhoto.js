const fs = require('fs');
const axios = require('axios');

module.exports = {
    config: {
        name: 'gcphoto',
        aliases: ['gcphoto'],
        author: 'Rasin',
        version: '2.0',
        countDown: 3,
        role: 1,
        prefix: true,
        usages: '!changephoto',
        category: 'box chat',
        description: 'Change group image'
    },

    onStart: async function ({ api, message, event }) {
        try {
            if (event.type !== 'message_reply') {
                return message.reply('Please reply to a photo');
            }

            if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) {
                return message.reply('You need to reply to a photo');
            }

            if (event.messageReply.attachments.length > 1) {
                return message.reply('Please reply to only 1 photo');
            }

            const rasin = event.messageReply.attachments[0].url;
            let groupImg = __dirname + '/cache/gc.png';
            let data = (await axios.get(rasin, { responseType: 'arraybuffer' })).data;

            fs.writeFileSync(groupImg, Buffer.from(data, 'utf-8'));
            
            api.changeGroupImage(fs.createReadStream(groupImg), event.threadID, () => {
                fs.unlinkSync(groupImg);
                message.reply('✅ Successfully changed group photo!');
            });

        } catch (error) {
            console.error('Error changing group photo:', error);
            return message.reply('❌ Failed to change group photo. Please try again!');
        }
    }
}
