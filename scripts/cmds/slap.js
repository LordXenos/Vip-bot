const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const axios = require("axios");
const { config } = global.GoatBot;

module.exports = {
  config: {
    name: "slap",
    aliases: ["maar", "thappor"],
    version: "1.1",
    author: "Rasin",
    countDown: 5,
    role: 0,
    shortDescription: "Slap Someone",
    longDescription: "Slap anyone!!!",
    category: "image",
    guide: {
      en: "{pn} @tag | reply"
    }
  },

  langs: {
    en: {
      noTarget: "Reply or mention someone to slap 😏"
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    let uid1 = event.senderID;
    let uid2;

    if (event.type === "message_reply") {
      uid2 = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
    }

    if (!uid2) return message.reply(getLang("noTarget"));
    if (config.adminBot.includes(uid2)) return message.reply("Bro boss ke slap korte aschos? 💀");

    try {
      const getFbAvatar = async (fbId) => {
        const fbUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${fbId}`;
        const res = await axios.get(fbUrl);

        if (res.status === 302 && res.headers.location) {
          return res.headers.location;
        } else {
          return fbUrl;
        }
      };

      const avatar1 = await getFbAvatar(uid1);
      const avatar2 = await getFbAvatar(uid2);

      const img = await new DIG.Spank().getImage(avatar1, avatar2);

      const pathSave = `${__dirname}/tmp/slap_${uid1}_${uid2}.png`;
      fs.ensureDirSync(`${__dirname}/tmp`);
      fs.writeFileSync(pathSave, Buffer.from(img));

      await message.reply({
        body: "Thas Thus 👋🏻",
        attachment: fs.createReadStream(pathSave)
      });

      fs.unlinkSync(pathSave);

    } catch (e) {
      console.error(e);
      return message.reply("Image gen failed 💀 try again later");
    }
  }
};
