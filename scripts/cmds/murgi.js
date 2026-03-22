const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { config } = global.GoatBot;

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "murgi",
    version: "1.8",
    author: "Rasin",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: {
      en: "{pn} @mention or reply to a message"
        + "\n{pn} <name>: search user by name"
        + "\n{pn} <uid>: use specific user ID"
    }
  },

  langs: {
    en: {
      noTarget: "❌ Mention, reply, give UID, or enter a name to make murgi someone",
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      adminProtected: "Lol amar boss re Target koros ken?😒",
      processing: "Here's your murgi image 🐸",
      error: "🥹error, contact Rasin."
    }
  },

  onStart: async function({ api, event, args, getLang, usersData }) {
    const obfuscatedAuthor = String.fromCharCode(82, 97, 115, 105, 110); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "You are not authorized to change the author name.\n", 
        event.threadID, 
        event.messageID
      );
    }

    const { senderID, mentions, threadID, messageID, messageReply } = event;
    let id;

    if (Object.keys(mentions).length > 0) {
      id = Object.keys(mentions)[0];
    } 
    else if (messageReply) {
      id = messageReply.senderID;
    } 
    else if (args[0] && /^\d+$/.test(args[0])) {
      id = args[0]; 
    } 
    else if (args[0]) {
      const query = args.join(" ");
      const matches = await findUserByName(api, usersData, event.threadID, query);

      if (matches.length === 0) {
        return api.sendMessage(
          getLang("notFound", query.replace(/@/g, "")),
          threadID,
          messageID
        );
      }

      if (matches.length > 1) {
        const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
        return api.sendMessage(
          getLang("multiple", query.replace(/@/g, ""), matchList),
          threadID,
          messageID
        );
      }

      id = matches[0].uid;
    } 
    else {
      return api.sendMessage(
        getLang("noTarget"),
        threadID,
        messageID
      );
    }

    if (config.adminBot.includes(id)) {
      return api.sendMessage(
        getLang("adminProtected"),
        threadID,
        messageID
      );
    }
    
    try {
      const apiUrl = await baseApiUrl();
      const url = `${apiUrl}/api/murgi?user=${id}`;
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `murgi_${id}.png`);
      fs.writeFileSync(filePath, response.data);
      
      api.sendMessage(
        { attachment: fs.createReadStream(filePath), body: getLang("processing") },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    } catch (err) {
      api.sendMessage(getLang("error"), threadID, messageID);
    }
  }
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