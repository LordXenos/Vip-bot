const axios = require("axios");

module.exports = {
  config: {
    name: "ddwin",
    version: "2.0",
    author: "Vydron1122",
    countDown: 5,
    role: 0,
    description: {
      en: "🕌 Shows Sehri, Iftar & 5 daily prayer times for Ramadan (Dhaka)"
    },
    category: "islamic",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event, api }) {
    const waitMsg = await message.reply("⏳ Fetching Ramadan prayer times for Dhaka...");

    try {
      // Dhaka, Bangladesh এর কোঅর্ডিনেট
      const latitude = 23.777176;
      const longitude = 90.399452;
      const timezone = "Asia/Dhaka";
      const method = 2; // Islamic Society of North America (ISNA)

      // আজকের তারিখ (দিন-মাস-বছর)
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

      // Aladhan API কল
      const response = await axios.get(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}&timezonestring=${timezone}`
      );

      const timings = response.data.data.timings;
      const date = response.data.data.date;

      // রামাদান চেক (হিজরি মাস)
      const hijriMonth = date.hijri.month.en;
      const isRamadan = hijriMonth === "Ramadan";

      // মেসেজ তৈরি
      let msg = `━━━━━━━━━━━━━━━━\n`;
      msg += `     🕋 𝐑𝐀𝐌𝐀𝐃𝐀𝐍 𝟏𝟒𝟒𝟕 🕋\n`;
      msg += `━━━━━━━━━━━━━━━━\n\n`;

      msg += `📅 𝐆𝐫𝐞𝐠𝐨𝐫𝐢𝐚𝐧: ${date.readable}\n`;
      msg += `📅 𝐇𝐢𝐣𝐫𝐢: ${date.hijri.date} (${date.hijri.month.en})\n`;
      msg += `📍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧: Dhaka, Bangladesh\n\n`;

      if (!isRamadan) {
        msg += `⚠️ 𝐍𝐨𝐭𝐞: Today is ${hijriMonth}, not Ramadan.\n`;
        msg += `📌 Showing standard prayer times.\n\n`;
      } else {
        msg += `✨ 𝐑𝐚𝐦𝐚𝐝𝐚𝐧 𝐌𝐮𝐛𝐚𝐫𝐚𝐤! ✨\n\n`;
      }

      msg += `━━【 𝐒𝐞𝐡𝐫𝐢 & 𝐈𝐟𝐭𝐚𝐫 】━━\n`;
      msg += `🌙 𝐒𝐞𝐡𝐫𝐢 (Imsak): ${timings.Imsak}\n`;
      msg += `🍽️ 𝐈𝐟𝐭𝐚𝐫 (Maghrib): ${timings.Maghrib}\n\n`;

      msg += `━━【 𝟓 𝐖𝐚𝐪𝐭 𝐒𝐚𝐥𝐚𝐡 】━━\n`;
      msg += `🕋 𝐅𝐚𝐣𝐫: ${timings.Fajr}\n`;
      msg += `☀️ 𝐃𝐡𝐮𝐡𝐫: ${timings.Dhuhr}\n`;
      msg += `🌆 𝐀𝐬𝐫: ${timings.Asr}\n`;
      msg += `🌇 𝐌𝐚𝐠𝐡𝐫𝐢𝐛: ${timings.Maghrib}\n`;
      msg += `🌃 𝐈𝐬𝐡𝐚: ${timings.Isha}\n\n`;

      msg += `━━━━━━━━━━━━━━━━\n`;
      msg += `🔁 Type !ddwin again to refresh\n`;
      msg += `━━━━━━━━━━━━━━━━`;

      return api.editMessage(msg, waitMsg.messageID, event.threadID);

    } catch (error) {
      console.error("DDWin Error:", error.message);
      return api.editMessage(
        `❌ Error fetching prayer times.\n${error.message}`,
        waitMsg.messageID,
        event.threadID
      );
    }
  }
};