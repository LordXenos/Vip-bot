const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmhd = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "fakechat",
    aliases: ["fc", "F", "fake"],
    version: "2.5.0",
    author: "MahMUD",
    role: 0,
    category: "fun",
    description: "Generate fake chat via reply, mention, name search, or user uid",
    countDown: 5,
    guide: {
      en: "{pn} <text> - Reply to a message to create fake chat"
        + "\n{pn} @mention <text> - Mention user to create fake chat"
        + "\n{pn} <name> <text> - Search user by name to create fake chat"
        + "\n{pn} <uid> <text> - Use user ID to create fake chat"
    }
  },

  langs: {
    en: {
      noTarget: "❌ Please reply, mention, provide user uid, or enter a name.",
      noText: "❌ Please provide the text for the fake chat.",
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      error: "🥹error, contact MahMUD.",
      unauthorized: "❌ | You are not authorized to change the author name."
    }
  },
  
  onStart: async ({ event, message, args, usersData, api, getLang }) => {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        getLang("unauthorized"),
        event.threadID,
        event.messageID
      );
    }
    
    try {
      let targetId;
      let userText = args.join(" ").trim();
      
      if (event.messageReply) {
        targetId = event.messageReply.senderID || event.messageReply.sender?.id;
      } 
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetId = Object.keys(event.mentions)[0];
        const mentionName = event.mentions[targetId];
        userText = args.join(" ").replace(new RegExp(`@?${mentionName}`, "gi"), "").trim();
      } 
      else if (args.length > 0 && /^\d+$/.test(args[0])) {
        targetId = args[0];
        userText = args.slice(1).join(" ").trim();
      } 
      else if (args.length > 0) {
        const firstWord = args[0];
        const matches = await findUserByName(api, usersData, event.threadID, firstWord);

        if (matches.length === 0) {
          return message.reply(getLang("notFound", firstWord.replace(/@/g, "")));
        }

        if (matches.length > 1) {
          const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
          return message.reply(getLang("multiple", firstWord.replace(/@/g, ""), matchList));
        }

        targetId = matches[0].uid;
        userText = args.slice(1).join(" ").trim();
      } 
      else {
        return message.reply(getLang("noTarget"));
      }
      
      if (!userText) return message.reply(getLang("noText"));
      
      let userName = "Unknown";
      try {
        userName = (await usersData.getName(targetId)) || targetId;
      } catch {
        userName = targetId;
      }
      
      const baseApi = await mahmhd();
      const apiUrl = `${baseApi}/api/fakechat?id=${targetId}&name=${encodeURIComponent(
        userName
      )}&text=${encodeURIComponent(userText)}`;
      
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `fakechat_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));
      
      await message.reply({
        attachment: fs.createReadStream(filePath),
      });
      
      setTimeout(() => {
        try { fs.unlinkSync(filePath); } catch {}
      }, 5000);
    } catch {
      await message.reply(getLang("error"));
    }
  },
};

async function findUserByName(api, usersData, threadID, query) {
  try {
    const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
    const threadInfo = await api.getThreadInfo(threadID);
    const ids = threadInfo.participantIDs || [];
    const matches = [];

    for (const uid of ids) {
      try {
        const name = (await usersData.getName(uid)).toLowerCase();
        if (name.includes(cleanQuery)) {
          matches.push({ uid, name: await usersData.getName(uid) });
        }
      } catch {}
    }

    return matches;
  } catch {
    return [];
  }
}