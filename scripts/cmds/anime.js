const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return response.data.mahmud;
};

module.exports = {
        config: {
                name: "anime",
                aliases: ["anivid", "animevideo"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "র‍্যান্ডম এনিমে ভিডিও স্ট্যাটাস পান",
                        en: "Get a random anime video status",
                        vi: "Lấy một video anime ngẫu nhiên"
                },
                category: "anime",
                guide: {
                        bn: '   {pn}: র‍্যান্ডম ভিডিও পেতে ব্যবহার করুন'
                                + '\n   {pn} list: এনিমে ক্যাটাগরিগুলো দেখুন',
                        en: '   {pn}: Get a random anime video'
                                + '\n   {pn} list: See available categories',
                        vi: '   {pn}: Lấy video anime ngẫu nhiên'
                                + '\n   {pn} list: Xem các danh mục có sẵn'
                }
        },

        langs: {
                bn: {
                        noCat: "× কোনো এনিমে ক্যাটাগরি খুঁজে পাওয়া যায়নি।",
                        wait: "🐤 | এনিমে ভিডিও লোড হচ্ছে... একটু অপেক্ষা করো বেবি! <😘",
                        noVid: "× কোনো ভিডিও খুঁজে পাওয়া যায়নি!",
                        success: "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noCat: "× No anime categories found.",
                        wait: "🐤 | Loading random anime video... Please wait baby! <😘",
                        noVid: "× No videos found.",
                        success: "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 <😘",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noCat: "× Không tìm thấy danh mục anime nào.",
                        wait: "🐤 | Đang tải video anime... Chờ chút nhé cưng! <😘",
                        noVid: "× Không tìm thấy video nào.",
                        success: "✨ | Video anime của cưng đây <😘",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const cacheDir = path.join(__dirname, "cache");
                const filePath = path.join(cacheDir, `anime_${Date.now()}.mp4`);
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                try {
                        const apiUrl = await mahmud();

                        if (args[0] === "list") {
                                const response = await axios.get(`${apiUrl}/api/album/list`);
                                const lines = response.data.message.split("\n");
                                const animeCategories = lines.filter(line =>
                                        /anime/i.test(line) && !/hanime/i.test(line) && !/Total\s*anime/i.test(line)
                                );
                                if (!animeCategories.length) return message.reply(getLang("noCat"));
                                return message.reply(animeCategories.join("\n"));
                        }

                        const waitMsg = await message.reply(getLang("wait"));
                        
                        const res = await axios.get(`${apiUrl}/api/album/mahmud/videos/anime?userID=${event.senderID}`);
                        if (!res.data.success || !res.data.videos.length) {
                                if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                                return message.reply(getLang("noVid"));
                        }

                        const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];
                        
                        const videoRes = await axios({
                                url,
                                method: "GET",
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        const writer = fs.createWriteStream(filePath);
                        videoRes.data.pipe(writer);

                        await new Promise((resolve, reject) => {
                                writer.on("finish", resolve);
                                writer.on("error", reject);
                        });

                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(filePath)
                        }, () => {
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Anime Video Error:", err);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
