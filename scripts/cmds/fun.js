const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "fun",
                aliases: ["dig", "funny"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "বিভিন্ন মজাদার ইমেজ ইফেক্ট তৈরি করুন",
                        en: "Create various funny image effects",
                        vi: "Tạo các hiệu ứng hình ảnh hài hước khác nhau"
                },
                category: "fun",
                guide: {
                        bn: '   {pn} <ইফেক্ট_নাম> <@ট্যাগ>: ইফেক্ট তৈরি করুন'
                                + '\n   {pn} list: সব ইফেক্টের নাম দেখুন',
                        en: '   {pn} <type> <@tag>: Apply an effect'
                                + '\n   {pn} list: See all available effects',
                        vi: '   {pn} <loại> <@gắn thẻ>: Áp dụng hiệu ứng'
                                + '\n   {pn} list: Xem tất cả các hiệu ứng có sẵn'
                }
        },

        langs: {
                bn: {
                        noType: "× বেবি, ইফেক্টের নাম দাও! সব দেখতে লিখুন: {pn} list",
                        listErr: "× ইফেক্ট লিস্ট আনতে সমস্যা হয়েছে।",
                        noTarget: "× বেবি, কাউকে মেনশন দাও, রিপ্লাই করো অথবা UID দাও! 🎭",
                        success: "✅ Effect: %1 সফল হয়েছে! 💥",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noType: "× Baby, provide an effect type! Use '{pn} list' to see all.",
                        listErr: "× Failed to fetch effect list.",
                        noTarget: "× Baby, mention, reply, or provide UID of the target! 🎭",
                        success: "✅ Effect: %1 successful! 💥",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noType: "× Cưng ơi, hãy nhập loại hiệu ứng! Sử dụng '{pn} list' để xem tất cả.",
                        listErr: "× Không thể tải danh sách hiệu ứng.",
                        noTarget: "× Cưng ơi, hãy gắn thẻ, phản hồi hoặc cung cấp UID! 🎭",
                        success: "✅ Hiệu ứng: %1 thành công! 💥",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { mentions, messageReply, senderID } = event;
                const type = args[0]?.toLowerCase();
                const baseUrl = await baseApiUrl();

                if (!type) return message.reply(getLang("noType"));

                if (type === "list") {
                        try {
                                const res = await axios.get(`${baseUrl}/api/dig/list`);
                                const types = res.data.types || [];
                                return message.reply(`🎭 Available Effects:\n\n${types.join(", ")}`);
                        } catch (err) {
                                return message.reply(getLang("listErr"));
                        }
                }

                let targetID;
                if (messageReply) {
                        targetID = messageReply.senderID;
                } else if (Object.keys(mentions).length > 0) {
                        targetID = Object.keys(mentions)[0];
                } else if (args[1] && !isNaN(args[1])) {
                        targetID = args[1];
                }

                if (!targetID) return message.reply(getLang("noTarget"));

                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const isTwoUser = ["kiss", "fuse", "buttslap", "slap", "spank", "bed"].includes(type);
                        let url = isTwoUser 
                                ? `${baseUrl}/api/dig?type=${type}&user=${senderID}&user2=${targetID}`
                                : `${baseUrl}/api/dig?type=${type}&user=${targetID}`;

                        const response = await axios.get(url, { responseType: "arraybuffer" });
                        
                        const isGif = ["trigger", "triggered"].includes(type);
                        const ext = isGif ? "gif" : "png";
                        const filePath = path.join(cacheDir, `fun_${Date.now()}.${ext}`);

                        fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

                        return message.reply({
                                body: getLang("success", type.toUpperCase()),
                                attachment: fs.createReadStream(filePath)
                        }, () => {
                                api.setMessageReaction("🪽", event.messageID, () => {}, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Fun Command Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
