const fs = require("fs-extra");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "hug",
    version: "1.2.0",
    author: "Rasin",
    countDown: 5,
    role: 0,
    longDescription: "{p}hug @mention someone you want to hug that person 🫂",
    category: "fun",
    guide: {
      en: "{pn} @mention - Hug mentioned user"
        + "\n{pn} <name> - Search and hug user by name"
        + "\n{pn} <uid> - Hug user by ID"
        + "\n{pn} [reply] - Hug replied user"
    },
    prefix: true,
    notes: "If you change the author then the command will not work and not usable"
  },

  langs: {
    en: {
      noTarget: "Please mention, reply, or enter a name of someone to hug",
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      error: "⚠️ An error occurred, try again later.",
      authError: "⚠️ Command author mismatch. Please restore original author name to use this command.",
      message: "🌻✨ ⋆˚✿˖°────୨ᰔ୧────°˖✿˚⋆ 🌷🧸\n\n𝐀 𝐰𝐚𝐫𝐦 𝐡𝐮𝐠\n\n🧸🎀 ⋆˚✿˖°────୨ᰔ୧────°˖✿˚⋆ ✨🌻"
    }
  },

  onStart: async function ({ api, message, event, usersData, args, getLang }) {
    const config = module.exports.config;
    const eAuth = "UmFzaW4=";
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");
    if (config.author !== dAuth) {
      return message.reply(getLang("authError"));
    }

    let one = event.senderID, two;
    const mention = Object.keys(event.mentions || {});
    
    if (mention.length > 0) {
      two = mention[0];
    }
    else if (event.type === "message_reply") {
      two = event.messageReply.senderID;
    }
    else if (args[0] && /^\d+$/.test(args[0])) {
      two = args[0];
    }
    else if (args[0]) {
      const query = args.join(" ");
      const matches = await findUserByName(api, usersData, event.threadID, query);

      if (matches.length === 0) {
        return message.reply(getLang("notFound", query.replace(/@/g, "")));
      }

      if (matches.length > 1) {
        const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
        return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
      }

      two = matches[0].uid;
    }
    else {
      return message.reply(getLang("noTarget"));
    }

    try {
      const avatarURL1 = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${one}`;
      const avatarURL2 = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${two}`;

      const canvas = createCanvas(800, 750);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://files.catbox.moe/qxovn9.jpg");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatar1 = await loadImage(avatarURL1);
      const avatar2 = await loadImage(avatarURL2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(610, 340, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 525, 255, 170, 170);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(230, 350, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 145, 265, 170, 170);
      ctx.restore();

      const outputPath = `${__dirname}/tmp/hug_image.png`;
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      message.reply(
        {
          body: getLang("message"),
          attachment: fs.createReadStream(outputPath)
        },
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error(error.message);
      api.sendMessage(getLang("error"), event.threadID);
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