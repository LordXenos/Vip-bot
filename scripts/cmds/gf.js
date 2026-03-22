const axios = require('axios');
const request = require('request');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "gfde",
        version: "1.0.0",
        author: "Rasin",
        countDown: 5,
        role: 0,
        description: {
            en: "empty ()"
        },
        category: "fun",
        guide: {
            en: "{n}"
        }
    },

    onStart: async function () {},

    onChat: async function ({ api, event, message }) {
        const input = event.body;
        if (input && (
                input.trim().toLowerCase().includes('gf de') || 
                input.trim().toLowerCase().includes('bot gf de') || 
                input.trim().toLowerCase().includes('need gf')
            )) {
            try {
                api.setMessageReaction("⏳", event.messageID, () => {}, true);

                const response = await axios.get('https://rasin-x-apis-main.onrender.com/api/rasin/gf');

                if (response.data && response.data.gf && response.data.gf.title && response.data.gf.url) {
                    const { title, url } = response.data.gf;

                    const filePath = path.join(__dirname, 'cache', `${Date.now()}.jpg`);
                    const writer = fs.createWriteStream(filePath);

                    request(url)
                        .pipe(writer)
                        .on('finish', () => {
                            api.setMessageReaction("✅", event.messageID, () => {}, true);

                            message.reply({
                                body: title,
                                attachment: fs.createReadStream(filePath)
                            }, () => {
                                fs.unlinkSync(filePath);
                            });
                        });
                } else {
                    throw new Error('Invalid response structure');
                }

            } catch (error) {
                console.error('Error fetching data 😐:', error.message, error.response?.data || '');
                message.reply('Error fetching data. Try again later. 😶‍🌫️');
            }
        }
    }
};