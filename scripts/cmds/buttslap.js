const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "buttslap",
                aliases: ["butslap", "slap"],
                version: "1.7",
                author: "MahMUD",
                countDown: 8,
                role: 0,
                description: {
                        bn: "কাউকে বাট-স্ল্যাপ ইফেক্ট দিন",
                        en: "Give someone a butt-slap effect",
                        vi: "Tạo hiệu ứng vỗ mông cho ai đó"
                },
                category: "fun",
                guide: {
                        bn: '   {pn} <@tag>: কাউকে ট্যাগ করে স্ল্যাপ দিন'
                                + '\n   {pn} <uid>: UID দিয়ে ইফেক্ট তৈরি করুন'
                                + '\n   (অথবা মেসেজে রিপ্লাই দিয়ে ব্যবহার করুন)',
                        en: '   {pn} <@tag>: Slap someone by tagging'
                                + '\n   {pn} <uid>: Create effect using UID'
                                + '\n   (Or use by replying to a message)',
                        vi: '   {pn} <@tag>: Tát ai đó bằng cách gắn thẻ'
                                + '\n   {pn} <uid>: Tạo hiệu ứng bằng UID'
                                + '\n   (Hoặc phản hồi tin nhắn)'
                }
        },

        langs: {
                bn: {
                        noTarget: "× বেবি, কাকে স্ল্যাপ দিবে তাকে মেনশন দাও, রিপ্লাই করো অথবা UID দাও! 💥",
                        success: "Effect: buttslap successful 💥",
                        error: "× ইফেক্ট তৈরি করতে সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noTarget: "× Baby, mention, reply, or provide UID of the target! 💥",
                        success: "Effect:  betha paicho🥹? 🌚💥",
                        error: "× Failed to create effect: %1. Contact MahMUD for help."
                },
                vi: {
                        noTarget: "× Cưng ơi, hãy gắn thẻ, phản hồi hoặc cung cấp UID mục tiêu! 💥",
                        success: "Hiệu ứng: buttslap thành công 💥",
                        error: "× Lỗi tạo hiệu ứng: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { mentions, messageReply, senderID } = event;
                let id2;

                if (messageReply) {
                        id2 = messageReply.senderID;
                } else if (Object.keys(mentions).length > 0) {
                        id2 = Object.keys(mentions)[0];
                } else if (args[0] && !isNaN(args[0])) {
                        id2 = args[0];
                }

                if (!id2) return message.reply(getLang("noTarget"));

                const cacheDir = path.join(__dirname, "cache");
                const filePath = path.join(cacheDir, `slap_${id2}.png`);

                try {
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                        const baseUrl = await baseApiUrl();
                        const url = `${baseUrl}/api/dig?type=buttslap&user=${senderID}&user2=${id2}`;

                        const response = await axios.get(url, { responseType: "arraybuffer" });
                        fs.writeFileSync(filePath, Buffer.from(response.data));

                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(filePath)
                        }, () => {
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Buttslap Error:", err);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
