const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "flaggame",
                aliases: ["flag"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "পতাকা দেখে দেশের নাম অনুমান করার খেলা",
                        en: "Guess the country name by looking at the flag",
                        vi: "Đoán tên quốc gia bằng cách nhìn vào lá cờ"
                },
                category: "game",
                guide: {
                        bn: '   {pn}: গেমটি শুরু করতে লিখুন',
                        en: '   {pn}: Type to start the game',
                        vi: '   {pn}: Nhập để bắt đầu trò chơi'
                }
        },

        langs: {
                bn: {
                        start: "🌍 | একটি পতাকার ছবি এসেছে! দেশের নামটি বলো তো বেবি?",
                        correct: "✅ | একদম সঠিক উত্তর বেবি!\n\nতুমি জিতেছো %1 কয়েন এবং %2 এক্সপি।",
                        wrong: "🥺 | উত্তরটি ভুল হয়েছে বেবি!\n\n🏳️ সঠিক উত্তর ছিল: %1",
                        notYour: "× বেবি, এটি তোমার জন্য নয়! নিজের জন্য গেম শুরু করো। >🐸",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        start: "🌍 | A random flag has appeared! Guess the country name, baby.",
                        correct: "✅ | Correct answer, baby!\n\nYou have earned %1 coins and %2 exp.",
                        wrong: "🥺 | Wrong Answer, baby!\n\nThe Correct answer was: %1",
                        notYour: "× This is not your flag, baby! >🐸",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        start: "🌍 | Một lá cờ đã xuất hiện! Đoán tên quốc gia đi cưng.",
                        correct: "✅ | Đáp án chính xác cưng ơi!\n\n✨ Bạn nhận được %1 xu và %2 exp.",
                        wrong: "🥺 | Sai rồi cưng ơi!\n\n🏳️ Đáp án đúng là: %1",
                        notYour: "× Đây không phải lá cờ của bạn cưng à! >🐸",
                        error: "× Lỗi: %1. Liên hệ MahMUD để được hỗ trợ."
                }
        },

        onReply: async function ({ api, event, Reply, usersData, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68); 
                if (module.exports.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { flag, author } = Reply;
                const getCoin = 500;
                const getExp = 121;
                
                if (event.senderID !== author) {
                        return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);
                }

                const reply = event.body.trim().toLowerCase();
                const userData = await usersData.get(event.senderID);
                
                await api.unsendMessage(Reply.messageID);

                if (reply === flag.toLowerCase()) {
                        userData.money += getCoin;
                        userData.exp += getExp;
                        await usersData.set(event.senderID, userData);

                        return api.sendMessage(getLang("correct", getCoin, getExp), event.threadID, event.messageID);
                } else {
                        return api.sendMessage(getLang("wrong", flag), event.threadID, event.messageID);
                }
        },

        onStart: async function ({ api, event, getLang }) {
                try {
                        const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68); 
                        if (this.config.author !== authorName) return;

                        const apiUrl = await baseApiUrl();
                        const response = await axios.get(`${apiUrl}/api/flag`, {
                                responseType: "json",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        const { link, country } = response.data;

                        const imageStream = await axios({
                                method: "GET",
                                url: link,
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        return api.sendMessage({
                                        body: getLang("start"),
                                        attachment: imageStream.data
                                },
                                event.threadID,
                                (err, info) => {
                                        if (err) return api.sendMessage("❌ Failed to send flag image.", event.threadID);

                                        global.GoatBot.onReply.set(info.messageID, {
                                                commandName: this.config.name,
                                                type: "reply",
                                                messageID: info.messageID,
                                                author: event.senderID,
                                                flag: country
                                        });

                                        setTimeout(() => {
                                                api.unsendMessage(info.messageID);
                                        }, 40000); 
                                },
                                event.messageID
                        );
                } catch (error) {
                        console.error("FlagGame Error:", error.message);
                        return api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
                }
        }
};
