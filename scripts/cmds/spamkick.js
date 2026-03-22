const axios = require("axios");

module.exports = {
        config: {
                name: "spamkick",
                aliases: ["antispam"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "গ্রুপে স্প্যামিং করলে ইউজারকে অটোমেটিক কিক দিন",
                        en: "Auto kick users who spam messages in a group chat",
                        vi: "Tự động kích người dùng spam tin nhắn trong nhóm"
                },
                category: "box chat",
                guide: {
                        bn: '   {pn} on/off: স্প্যাম কিক চালু বা বন্ধ করতে ব্যবহার করুন',
                        en: '   {pn} on/off: Use to enable or disable spam kick',
                        vi: '   {pn} on/off: Sử dụng để bật hoặc tắt tính năng kích spam'
                }
        },

        langs: {
                bn: {
                        on: "✅ | এই গ্রুপে স্প্যাম কিক সিস্টেম চালু করা হয়েছে!",
                        off: "❎ | এই গ্রুপে স্প্যাম কিক সিস্টেম বন্ধ করা হয়েছে!",
                        notActive: "❎ | স্প্যাম কিক এই গ্রুপে আগে থেকেই বন্ধ আছে।",
                        kickMsg: "🚫 | %1 কে স্প্যামিং করার জন্য গ্রুপ থেকে রিমুভ করা হয়েছে।\nইউজার আইডি: %2",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        on: "✅ | Spam kick has been turned on for this group!",
                        off: "❎ | Spam kick has been turned off for this thread.",
                        notActive: "❎ | Spam kick is not active on this thread.",
                        kickMsg: "🚫 | %1 has been removed for spamming.\nUser ID: %2",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        on: "✅ | Hệ thống kích spam đã được bật cho nhóm này!",
                        off: "❎ | Hệ thống kích spam đã bị tắt cho nhóm này.",
                        notActive: "❎ | Hệ thống kích spam không hoạt động trong nhóm này.",
                        kickMsg: "🚫 | %1 đã bị xóa vì spam.\nID người dùng: %2",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onChat: async function ({ api, event, usersData, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) return;

                const { senderID, threadID, messageID } = event;
                if (!global.antispam) global.antispam = new Map();
                if (!global.antispam.has(threadID)) return;

                const threadInfo = global.antispam.get(threadID);
                if (!(senderID in threadInfo.users)) {
                        threadInfo.users[senderID] = { count: 1, time: Date.now() };
                } else {
                        threadInfo.users[senderID].count++;
                        const timePassed = Date.now() - threadInfo.users[senderID].time;
                        const messages = threadInfo.users[senderID].count;
                        const timeLimit = 80000; // 80 seconds
                        const messageLimit = 14;

                        if (messages > messageLimit && timePassed < timeLimit) {
                                api.removeUserFromGroup(senderID, threadID, async (err) => {
                                        if (err) return console.error(err);
                                        const name = await usersData.getName(senderID);
                                        api.sendMessage(getLang("kickMsg", name, senderID), threadID);
                                });
                                threadInfo.users[senderID] = { count: 1, time: Date.now() };
                        } else if (timePassed > timeLimit) {
                                threadInfo.users[senderID] = { count: 1, time: Date.now() };
                        }
                }
                global.antispam.set(threadID, threadInfo);
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!global.antispam) global.antispam = new Map();
                const { threadID, messageID } = event;

                switch (args[0]) {
                        case "on":
                                api.setMessageReaction("✅", messageID, () => {}, true);
                                global.antispam.set(threadID, { users: {} });
                                return message.reply(getLang("on"));
                        case "off":
                                api.setMessageReaction("❎", messageID, () => {}, true);
                                if (global.antispam.has(threadID)) {
                                        global.antispam.delete(threadID);
                                        return message.reply(getLang("off"));
                                } else {
                                        return message.reply(getLang("notActive"));
                                }
                        default:
                                return message.SyntaxError();
                }
        }
};
