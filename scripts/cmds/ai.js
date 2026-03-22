const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "ai",
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "এআই এর সাথে সরাসরি কথা বলুন",
                        en: "Chat directly with AI",
                        vi: "Trò chuyện trực tiếp với AI"
                },
                category: "ai",
                guide: {
                        bn: '   {pn} <প্রশ্ন>: যেকোনো কিছু জিজ্ঞাসা করুন\n   (রিপ্লাই দিয়ে কথা চালিয়ে যেতে পারেন)',
                        en: '   {pn} <question>: Ask anything to AI\n   (Reply to continue the chat)',
                        vi: '   {pn} <câu hỏi>: Hỏi bất cứ điều gì với AI\n   (Phản hồi để tiếp tục trò chuyện)'
                }
        },

        langs: {
                bn: {
                        noPrompt: "⚠️ বেবি, কিছু তো জিজ্ঞাসা করো! উদাহরণ: {pn} তুমি কে?",
                        noResponse: "× এআই থেকে কোনো উত্তর পাওয়া যায়নি।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noPrompt: "⚠️ Baby, please provide a question! Example: {pn} Who are you?",
                        noResponse: "× Sorry, I couldn't generate a response.",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noPrompt: "⚠️ Cưng ơi, hãy đặt câu hỏi! Ví dụ: {pn} Bạn là ai?",
                        noResponse: "× Xin lỗi, tôi không thể tạo phản hồi.",
                        error: "× Lỗi: %1. Liên hệ MahMUD để được hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const query = args.join(" ");
                if (!query) return message.reply(getLang("noPrompt"));

                return await handleAI(api, event, query, this.config.name, getLang);
        },

        onReply: async function ({ api, event, Reply, args, getLang }) {
                if (Reply.author !== event.senderID) return;

                const prompt = args.join(" ");
                if (!prompt) return;

                return await handleAI(api, event, prompt, this.config.name, getLang);
        }
};

async function handleAI(api, event, query, commandName, getLang) {
        try {
                const baseUrl = await mahmud();
                const apiUrl = `${baseUrl}/api/ai`;

                const response = await axios.post(
                        apiUrl,
                        { question: query },
                        { headers: { "Content-Type": "application/json" } }
                );

                const replyText = response.data.response || getLang("noResponse");

                api.sendMessage(replyText, event.threadID, (error, info) => {
                        if (!error) {
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: commandName,
                                        author: event.senderID,
                                        messageID: info.messageID
                                });
                        }
                }, event.messageID);

        } catch (err) {
                console.error("AI Error:", err);
                api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
        }
}
