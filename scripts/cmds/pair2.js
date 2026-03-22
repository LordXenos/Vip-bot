const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

const { getStreamFromURL } = global.utils;

module.exports = {
        config: {
                name: "pair2",
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "বিপরীত লিঙ্গের মেম্বারদের মধ্যে প্রোফাইল পিকচারসহ জোড়া মেলান",
                        en: "Match with opposite gender members including profile pictures",
                        vi: "Ghép đôi với các thành viên khác giới bao gồm cả ảnh hồ sơ"
                },
                category: "love",
                guide: {
                        bn: '   {pn}: আপনার পারফেক্ট জোড়া খুঁজতে ব্যবহার করুন',
                        en: '   {pn}: Use to find your perfect pair',
                        vi: '   {pn}: Sử dụng để tìm cặp đôi hoàn hảo của bạn'
                }
        },

        langs: {
                bn: {
                        noGender: "× বেবি, আপনার জেন্ডার প্রোফাইলে সেট করা নেই",
                        noMatch: "× দুঃখিত, এই গ্রুপে আপনার জন্য কোনো %1 মেম্বার পাওয়া যায়নি",
                        success: "💞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n• %1\n• %2\n\n𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: %3%",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noGender: "× Baby, your gender is not defined in your profile",
                        noMatch: "× Sorry, no %1 members found for you in this group",
                        success: "💞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠\n• %1\n• %2\n\n𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: %3%",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noGender: "× Cưng ơi, giới tính của cưng không được xác định",
                        noMatch: "× Rất tiếc, không tìm thấy thành viên %1 nào cho cưng",
                        success: "💞 𝐆𝐡𝐞́𝐩 đ𝐨̂𝐢 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠\n• %1\n• %2\n\n𝐓𝐲̉ 𝐥𝐞̣̂ 𝐭𝐢̀𝐧𝐡 𝐜𝐚̉𝐦: %3%",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, threadsData, message, usersData, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const uidI = event.senderID;
                        const threadData = await threadsData.get(event.threadID);
                        const senderInfo = threadData.members.find(mem => mem.userID == uidI);
                        const gender1 = senderInfo?.gender;

                        if (!gender1 || (gender1 !== "MALE" && gender1 !== "FEMALE")) {
                                return message.reply(getLang("noGender"));
                        }

                        const oppositeGender = gender1 === "MALE" ? "FEMALE" : "MALE";
                        const candidates = threadData.members.filter(
                                member => member.gender === oppositeGender && member.inGroup && member.userID !== uidI
                        );

                        if (candidates.length === 0) {
                                api.setMessageReaction("🥺", event.messageID, () => {}, true);
                                return message.reply(getLang("noMatch", oppositeGender.toLowerCase()));
                        }

                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const matched = candidates[Math.floor(Math.random() * candidates.length)];
                        const uid2 = matched.userID;
                        const name1 = await usersData.getName(uidI);
                        const name2 = await usersData.getName(uid2);
                        const lovePercent = Math.floor(Math.random() * 36) + 65;

                        const base = await baseApiUrl();
                        const apiUrl1 = `${base}/api/pfp?mahmud=${uidI}`;
                        const apiUrl2 = `${base}/api/pfp?mahmud=${uid2}`;

                        return message.reply({
                                body: getLang("success", name1, name2, lovePercent),
                                attachment: [
                                        await getStreamFromURL(apiUrl1),
                                        await getStreamFromURL(apiUrl2)
                                ]
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                        });

                } catch (err) {
                        console.error("Pair2 Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
