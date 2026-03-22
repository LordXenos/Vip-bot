const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "audio",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        en: "Download any song directly from YouTube",
                        bn: "যেকোনো গান সরাসরি ডাউনলোড করুন",
                        vi: "Tải bất kỳ bài hát nào trực tiếp"
                },
                category: "media",
                guide: {
                        en: '   {pn} <song name>\n   Example: {pn} stay justin bieber',
                        bn: '   {pn} <গানের নাম>\n   উদাহরণ: {pn} tui chinli na amay',
                        vi: '   {pn} <tên bài hát>\n   Ví dụ: {pn} see you again'
                }
        },

        onStart: async function ({ api, args, message, event }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68); 
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID } = event;
                const input = args.join(" ");

                if (!input) return api.sendMessage("• Baby, please provide a song name.", threadID, messageID);

                try {
                        const apiUrl = await baseApiUrl();
                        api.setMessageReaction("⏳", messageID, () => {}, true);
                  
                        const res = await axios.get(`${apiUrl}/api/ytb/search?q=${encodeURIComponent(input)}`);
                        const results = res.data.results;
                        
                        if (!results || results.length === 0) {
                                api.setMessageReaction("❌", messageID, () => {}, true);
                                return api.sendMessage("⭕ | Sorry baby, I couldn't find this song.", threadID, messageID);
                        }

                        const videoID = results[0].id;
                        const title = results[0].title;

                        api.setMessageReaction("⌛", messageID, () => {}, true);
                        await handleDownload(api, threadID, messageID, videoID, apiUrl, title);

                } catch (e) {
                        api.setMessageReaction("❌", messageID, () => {}, true);
                        return api.sendMessage(`❌ | Error: ${e.message} contact MahMUD`, threadID, messageID);
                }
        }
};

async function handleDownload(api, threadID, messageID, videoID, apiUrl, title) {
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const filePath = path.join(cacheDir, `music_${Date.now()}.mp3`);

        try {
                const res = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=audio`);
                const { downloadLink } = res.data.data;
                
                const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on('finish', () => {
                        api.sendMessage({
                                body: `✅ | Here is your song: ${title}`,
                                attachment: fs.createReadStream(filePath)
                        }, threadID, () => { 
                                api.setMessageReaction("✅", messageID, () => {}, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
                        }, messageID);
                });
        } catch (e) {
                api.sendMessage("❌ | Failed to download the audio!", threadID, messageID);
        }
}
