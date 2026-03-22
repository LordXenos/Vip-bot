const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const axios = require("axios");
const { config } = global.GoatBot;

module.exports = {
  config: {
    name: "lesbu",
    aliases: ["lesbu", "gay"],
    version: "2.7",
    author: "Rasin",
    countDown: 3,
    role: 0,
    shortDescription: "Find out who's gay",
    longDescription: "empty()",
    category: "fun",
    guide: {
      en: "{pn} @mention - Target mentioned user"
        + "\n{pn} <name> - Search and target user by name"
        + "\n{pn} <uid> - Target user by ID"
        + "\n{pn} <FB URL> - Target user by Facebook URL"
        + "\n{pn} [reply] - Target replied user"
    }
  },

  langs: {
    en: {
      noTarget: "Mention someone or reply message😁",
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      adminProtected: "Lol amar boss re Target koros ken?😒",
      invalidUrl: "Couldn't find the user from the Facebook link. Try using a UID instead.",
      error: "An error occurred while generating the image."
    }
  },

  onStart: async function ({ event, message, usersData, args, api, getLang }) {
    const pathSave = `${__dirname}/tmp/gay_${Date.now()}.png`;
    
    try {
      const input = args.join(" ");
      let uid = null;

      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      }
      else if (Object.keys(event.mentions || {}).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }
      else if (/^\d+$/.test(input)) {
        uid = input;
      }
      else if (input.includes("facebook.com")) {
        const res = await api.getUID(input).catch(() => null);
        if (!res) return message.reply(getLang("invalidUrl"));
        uid = res;
      }
      else if (input) {
        const query = input;
        const matches = await findUserByName(api, usersData, event.threadID, query);

        if (matches.length === 0) {
          return message.reply(getLang("notFound", query.replace(/@/g, "")));
        }

        if (matches.length > 1) {
          const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
          return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
        }

        uid = matches[0].uid;
      }

      if (!uid) return message.reply(getLang("noTarget"));
      if (config.adminBot.includes(uid)) return message.reply(getLang("adminProtected"));

      const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${uid}`;
      const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(response.data, "binary");

      const imgBuffer = await new DIG.Gay().getImage(avatarBuffer);
      await fs.outputFile(pathSave, imgBuffer);

      const userName = await usersData.getName(uid);
      const body = `🏳️‍🌈 Look😐 I found a lesbu😁 ${userName}`;

      await message.reply({
        body: body,
        attachment: fs.createReadStream(pathSave)
      });

      if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);

    } catch (error) {
      console.error("Error:", error);
      if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      return message.reply(getLang("error"));
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