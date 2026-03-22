const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const { config } = global.GoatBot;
const axios = require('axios')

module.exports = {
  config: {
    name: "slap2",
    aliases: ["thappor2"],
    version: "1.1",
    author: "Rasin",
    countDown: 5,
    role: 0,
    shortDescription: "Batslap image",
    longDescription: "Batslap image",
    category: "image",
    guide: {
      en: "   {pn} @tag"
    }
  },
  langs: {
    en: {
      noTag: "You must tag the person you want to slap"
    }
  },
  onStart: async function ({ event, message, usersData, args, getLang }) {

    

    let uid1 = event.senderID;
let uid2;

if (event.type === "message_reply") {
  uid2 = event.messageReply.senderID;
} else if (Object.keys(event.mentions).length > 0) {
  uid2 = Object.keys(event.mentions)[0];
}

if (!uid2)
  return message.reply(getLang("noTag"));

    
    if (config.adminBot.includes(uid2)) {
      return message.reply("Lol amar boss re Target koros ken?😒");
    }
    
    const avatarURL1 = await axios.get(`https://arshi-facebook-pp.vercel.app/api/pp?uid=${uid1}`, { responseType: "arraybuffer" })
    const avatarURL2 = await axios.get(`https://arshi-facebook-pp.vercel.app/api/pp?uid=${uid2}`, { responseType: "arraybuffer" })
    const img = await new DIG.Batslap().getImage(avatarURL1.data, avatarURL2.data);
    const pathSave = `${__dirname}/tmp/${uid1}_${uid2}Batslap.png`;
    fs.writeFileSync(pathSave, Buffer.from(img));
    let content = args.join(" ");

if (Object.keys(event.mentions).length > 0) {
  content = content.replace(Object.keys(event.mentions)[0], "");
}

    message.reply({
      body: `${(content || "Thappor Khaa 👋🏻")}`,
      attachment: fs.createReadStream(pathSave)
    }, () => fs.unlinkSync(pathSave));
  }
};

