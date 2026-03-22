const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair100",
    version: "5.2",
    author: "vydron69",
    countDown: 10,
    role: 0,
    description: "Premium Pair with fixed image 💞",
    category: "love",
    guide: "{pn} — find your perfect match"
  },

  onStart: async function ({ api, event, message }) {
    try {
      // Start Processing Reaction 🌸
      api.setMessageReaction("💐", event.messageID, () => {}, true);

      const thread = await api.getThreadInfo(event.threadID);
      const users = thread.userInfo;

      const me = users.find(u => u.id == event.senderID);
      const others = users.filter(u => u.id != event.senderID);
      if (!others.length) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("❌ No partner found");
      }

      // Random match from group
      const match = others[Math.floor(Math.random() * others.length)];
      const name1 = me.name;
      const name2 = match.name;

      // Fixed image URL
      const fixedImageUrl = "https://i.imgur.com/yk7eJHM.jpeg";

      // Download the image to cache
      const response = await axios.get(fixedImageUrl, { responseType: "arraybuffer" });
      const output = path.join(__dirname, "cache", `pair_fixed_${Date.now()}.jpeg`);
      fs.writeFileSync(output, Buffer.from(response.data));

      // Random Love Percentage 60–100
      const love = Math.floor(Math.random() * 41) + 60;

      // Beautiful Message
      const bodyMessage = `
╭───💞 PREMIUM PAIR 💞───╮
│
│ 👤 ${name1}
│        ❤️
│ 👤 ${name2}
│
│ 💘 Love Meter: ${love}%
│
│ ✨ Perfect Match Found
╰─────────────────────────
      `;

      // Send message with fixed image
      await message.reply({
        body: bodyMessage,
        attachment: fs.createReadStream(output)
      });

      // Done Reaction 🍬
      api.setMessageReaction("🍬", event.messageID, () => {}, true);

    } catch (err) {
      console.error("Pair Error:", err);
      // Fail Reaction ❌
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Something went wrong with Pair command.");
    }
  }
};