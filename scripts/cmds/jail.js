const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const axios = require('axios')

module.exports = {
  config: {
    name: "jail",
    version: "1.2",
    author: "Rasin",
    countDown: 5,
    role: 0,
    shortDescription: "Jail image",
    longDescription: "Jail image",
    category: "image",
    guide: {
      en: "{pn} @mention - Jail mentioned user"
        + "\n{pn} <name> - Search and jail user by name"
        + "\n{pn} <uid> - Jail user by ID"
        + "\n{pn} [reply] - Jail replied user"
    }
  },

  langs: {
    en: {
      noTag: "You must tag, enter name, or reply to the person you want to jail",
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      jailMessage: "You're in jail!"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang, api }) {
    const uid1 = event.senderID;
    let uid2;
    let contentText = args.join(' ');

    if (event.messageReply) {
      uid2 = event.messageReply.senderID;
    }
    else if (Object.keys(event.mentions || {}).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
      const mentionName = event.mentions[uid2];
      contentText = contentText.replace(new RegExp(`@?${mentionName}`, "gi"), "").trim();
    }
    else if (args[0] && /^\d+$/.test(args[0])) {
      uid2 = args[0];
      contentText = args.slice(1).join(' ');
    }
    else if (args[0]) {
      const query = args[0];
      const matches = await findUserByName(api, usersData, event.threadID, query);

      if (matches.length === 0) {
        return message.reply(getLang("notFound", query.replace(/@/g, "")));
      }

      if (matches.length > 1) {
        const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
        return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
      }

      uid2 = matches[0].uid;
      contentText = args.slice(1).join(' ');
    }
    else {
      return message.reply(getLang("noTag"));
    }

    const avatarURL2 = await axios.get(`https://arshi-facebook-pp.vercel.app/api/pp?uid=${uid2}`, { responseType: "arraybuffer" })
    const img = await new DIG.Jail().getImage(avatarURL2.data);
    const pathSave = `${__dirname}/tmp/${uid2}_Jail.png`;
    fs.writeFileSync(pathSave, Buffer.from(img));
    
    message.reply({
      body: `${(contentText || getLang("jailMessage"))} 🚔`,
      attachment: fs.createReadStream(pathSave)
    }, () => fs.unlinkSync(pathSave));
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