const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "countryinfo",
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        bn: "যেকোনো দেশের বিস্তারিত তথ্য জানুন",
                        en: "Get detailed information about any country",
                        vi: "Lấy thông tin chi tiết về bất kỳ quốc gia nào"
                },
                category: "info",
                guide: {
                        bn: '   {pn} <দেশের নাম>: তথ্য পেতে দেশের নাম লিখুন',
                        en: '   {pn} <country name>: Provide the country name',
                        vi: '   {pn} <tên quốc gia>: Cung cấp tên quốc gia'
                }
        },

        langs: {
                bn: {
                        noInput: "× বেবি, একটি দেশের নাম তো দাও! 🚩",
                        title: ">🎀 বেবি, এই নাও তোমার %1 দেশের তথ্য\n\n",
                        notFound: "× \"%1\" দেশের তথ্য খুঁজে পাওয়া যায়নি। প্রয়োজনে Contact MahMUD।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        noInput: "× Baby, please provide a country name! 🚩",
                        title: ">🎀 Baby, Here's your %1 Country Information\n\n",
                        notFound: "× Could not find info for \"%1\". Contact MahMUD for help.",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng cung cấp tên quốc gia! 🚩",
                        title: ">🎀 Cưng ơi, đây là thông tin về %1 nè\n\n",
                        notFound: "× Không tìm thấy thông tin cho \"%1\". Liên hệ MahMUD.",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const countryName = args.join(" ");
                if (!countryName) return message.reply(getLang("noInput"));

                try {
                        const baseUrl = await baseApiUrl();
                        const res = await axios.get(`${baseUrl}/api/country?name=${encodeURIComponent(countryName)}`);
                        
                        if (!res.data || !res.data.data) return message.reply(getLang("notFound", countryName));
                        
                        const d = res.data.data;
                        const msg = getLang("title", d.name) +
                                    `🌍 𝐍𝐚𝐦𝐞: ${d.name} ${d.emoji}\n` +
                                    `🏛️ 𝐂𝐚𝐩𝐢𝐭𝐚𝐥: ${d.capital}\n` +
                                    `👥 𝐏𝐨𝐩𝐮𝐥𝐚𝐭𝐢𝐨𝐧: ${d.population.toLocaleString()}\n` +
                                    `📏 𝐀𝐫𝐞𝐚: ${d.area.toLocaleString()} Sq Km\n` +
                                    `📚 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞𝐬: ${Array.isArray(d.languages) ? d.languages.join(", ") : d.languages}\n` +
                                    `🚩 𝐑𝐞𝐠𝐢𝐨𝐧: ${d.region}\n` +
                                    `💰 𝐂𝐮𝐫𝐫𝐞𝐧𝐜𝐲: ${Array.isArray(d.currency) ? d.currency.join(", ") : d.currency}\n` +
                                    `⏰ 𝐓𝐢𝐦𝐞𝐳𝐨𝐧𝐞: ${d.timezone}\n` +
                                    `🚧 𝐁𝐨𝐫𝐝𝐞𝐫𝐬: ${d.borders && d.borders.length > 0 ? d.borders.join(", ") : "None"}\n` +
                                    `🌐 𝐃𝐨𝐦𝐚𝐢𝐧: ${d.tld}\n` +
                                    `📍 𝐌𝐚𝐩: ${d.map}`;

                        return message.reply({
                                body: msg,
                                attachment: await global.utils.getStreamFromURL(d.flag)
                        });

                } catch (err) {
                        console.error("Country Info Error:", err);
                        return message.reply(getLang("error", err.message));
                }
        }
};
