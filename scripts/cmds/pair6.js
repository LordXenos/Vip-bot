const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "pair6",
    version: "1.0",
    author: "Vydron1122",
    countDown: 10,
    role: 0,
    description: {
      en: "💕 Magical anime couple style with profile pictures (Style 7)"
    },
    category: "love",
    guide: {
      en: "{pn} - Find your magical anime match"
    }
  },

  langs: {
    en: {
      noGender: "❌ Baby, your gender is not defined in your profile",
      noMatch: "😢 Sorry, no match found for you in this group",
      success: "💕 𝐌𝐚𝐠𝐢𝐜𝐚𝐥 𝐀𝐧𝐢𝐦𝐞 𝐂𝐨𝐮𝐩𝐥𝐞 💕\n━━━━━━━━━━━━━━━━\n👤 𝐘𝐨𝐮: %1\n👤 𝐌𝐚𝐭𝐜𝐡: %2\n💞 𝐋𝐨𝐯𝐞 𝐏𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: %3%\n━━━━━━━━━━━━━━━━\n✨ 𝐃𝐞𝐬𝐭𝐢𝐧𝐞𝐝 𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫 ✨",
      error: "❌ Error: %1"
    }
  },

  onStart: async function ({ api, event, message, getLang }) {
    const outputPath = path.join(__dirname, "cache", `pair7_${event.senderID}_${Date.now()}.png`);
    if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    try {
      api.setMessageReaction("✨", event.messageID, () => {}, true);
      
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;
      
      const myData = users.find((u) => u.id === event.senderID);
      if (!myData || !myData.gender) return message.reply(getLang("noGender"));
      
      const myGender = myData.gender.toUpperCase();
      
      let matchCandidates = [];
      if (myGender === "MALE") {
        matchCandidates = users.filter((u) => u.gender === "FEMALE" && u.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter((u) => u.gender === "MALE" && u.id !== event.senderID);
      } else {
        matchCandidates = users.filter((u) => u.id !== event.senderID);
      }
      
      if (matchCandidates.length === 0) {
        api.setMessageReaction("😢", event.messageID, () => {}, true);
        return message.reply(getLang("noMatch"));
      }
      
      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      
      const name1 = myData.name || "You";
      const name2 = selectedMatch.name || "Partner";
      const percentage = Math.floor(Math.random() * 100) + 1;
      
      const apiUrl = await baseApiUrl();
      
      // API same, style=7 (ম্যাজিকাল অ্যানিমে কাপল)
      const { data } = await axios.get(`${apiUrl}/api/pair/mahmud`, {
        params: {
          user1: event.senderID,
          user2: selectedMatch.id,
          style: 7  // style 7 = magical anime couple with sparkles
        },
        responseType: "arraybuffer",
        timeout: 30000
      });
      
      fs.writeFileSync(outputPath, Buffer.from(data));
      
      return message.reply({
        body: getLang("success", name1, name2, percentage),
        attachment: fs.createReadStream(outputPath)
      }, () => {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });
      
    } catch (err) {
      console.error("Pair7 Error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      return message.reply(getLang("error", err.message));
    }
  }
};
