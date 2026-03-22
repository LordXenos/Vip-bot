const axios = require('axios');
const fs = require('fs');

module.exports = {
    config: {
        name: 'imgur',
        aliases: ['imgup'],
        version: '1.0',
        author: 'Rasin',
        prefix: true,
        description: 'Upload images to Imgur',
        usages: '!imgur <reply to image>',
        countDown: 5,
        role: 0,
        category: 'tools'
    },

    onStart: async function ({ message, event, args, api }) {
        try {
            if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
                return message.reply('Please reply to an image to upload it to Imgur.');
            }

            const attachment = event.messageReply.attachments[0];

            if (attachment.type !== 'photo') {
                return message.reply('Please reply to an image only.');
            }

            const imageUrl = attachment.url;

            message.reply('Uploading image to Imgur...');

            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');
            const base64Image = imageBuffer.toString('base64');


            const uploadResponse = await axios.post('https://api.imgur.com/3/image', {
                image: base64Image,
                type: 'base64'
            }, {
                headers: {
                    'Authorization': 'Client-ID fc9369e9aea767c',
                    'Content-Type': 'application/json'
                }
            });

            if (uploadResponse.data && uploadResponse.data.data && uploadResponse.data.data.link) {
                const imgurLink = uploadResponse.data.data.link;
                const deleteHash = uploadResponse.data.data.deletehash;

                return message.reply(
                    `✅ Image uploaded successfully!\n\n` +
                    `🔗 Link: ${imgurLink}\n\n` +
                    `📊 Size: ${(uploadResponse.data.data.size / 1024).toFixed(2)} KB\n` +
                    `📐 Dimensions: ${uploadResponse.data.data.width}x${uploadResponse.data.data.height}`
                );
            } else {
                throw new Error('Invalid response from Imgur');
            }

        } catch (error) {
            console.error('Imgur upload error:', error);

            try {
                const attachment = event.messageReply.attachments[0];
                const imageUrl = attachment.url;

                const altResponse = await axios.get(`https://api.ryzendesu.vip/api/tool/imgur?url=${encodeURIComponent(imageUrl)}`);

                if (altResponse.data && altResponse.data.url) {
                    return message.reply(
                        `✅ Image uploaded successfully!\n\n` +
                        `🔗 Link: ${altResponse.data.url}`
                    );
                }
            } catch (altError) {
                console.error('error:', altError);
            }

            return message.reply('❌ Failed to upload image to Imgur. Please try again later.');
        }
    }
};