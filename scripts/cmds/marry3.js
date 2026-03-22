const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "married3",
    aliases: ['marry3'],
    version: "4.2.0",
    author: "Rasin",
    countDown: 5,
    role: 0,
    description: "Random marriage",
    category: "image",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, message, event, usersData }) {
    const senderID = event.senderID;
    const botID = api.getCurrentUserID();

    const threadInfo = await api.getThreadInfo(event.threadID);
    const users = threadInfo.userInfo;

    let senderGender;
    for (const u of users) {
      if (u.id === senderID) senderGender = u.gender;
    }

    let candidates = [];
    for (const u of users) {
      if (u.id === senderID || u.id === botID) continue;

      if (senderGender === "MALE" && u.gender === "FEMALE") candidates.push(u.id);
      else if (senderGender === "FEMALE" && u.gender === "MALE") candidates.push(u.id);
    }

    if (candidates.length === 0)
      return message.reply("Couldn't Find User");

    const targetID = candidates[Math.floor(Math.random() * candidates.length)];

    await message.reply("\n");

    try {
      const imagePath = await makeImage({ one: senderID, two: targetID });

      const name1 = await usersData.getName(senderID);
      const name2 = await usersData.getName(targetID);

      message.reply(
        {
          body: `🧸🎀 ⋆˚✿°────୨ᰔ୧────°✿˚ ✨🌻\n\n𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫 𝐟𝐨𝐫𝐞𝐯𝐞𝐫, 𝐚 𝐥𝐨𝐯𝐞 𝐬𝐭𝐨𝐫𝐲 𝐰𝐫𝐢𝐭𝐭𝐞𝐧 𝐢𝐧 𝐭𝐡𝐞 𝐬𝐭𝐚𝐫𝐬

${name1} ♡ ${name2}

🎀✨ ˚✿°────୨ᰔ୧────°✿˚ 🫶🏻🧸\n🎀🌷°✿˚\n𝐌𝐚𝐲 𝐲𝐨𝐮𝐫 𝐣𝐨𝐮𝐫𝐧𝐞𝐲 𝐛𝐞 𝐟𝐢𝐥𝐥𝐞𝐝 𝐰𝐢𝐭𝐡 𝐞𝐧𝐝𝐥𝐞𝐬𝐬 𝐥𝐨𝐯𝐞 𝐚𝐧𝐝 𝐡𝐚𝐩𝐩𝐢𝐧𝐞𝐬𝐬 🧸✨°`,
          mentions: [
            { id: senderID, tag: name1 },
            { id: targetID, tag: name2 }
          ],
          attachment: fs.createReadStream(imagePath)
        },
        () => fs.unlinkSync(imagePath)
      );
    } catch (e) {
      console.error(e);
      message.reply("Something went wrong 🥲");
    }
  }
};

async function makeImage({ one, two }) {
  const root = path.resolve(__dirname, "cache", "canvas");
  const template = path.resolve(root, "marriedv4.png");
  const out = path.resolve(root, `married4_${one}_${two}.png`);
  const a1 = path.resolve(root, `avt_${one}.png`);
  const a2 = path.resolve(root, `avt_${two}.png`);

  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });

  const get = id =>
    axios.get(
      `https://arshi-facebook-pp.vercel.app/api/pp?uid=${id}`,
      { responseType: "arraybuffer" }
    );

  fs.writeFileSync(a1, Buffer.from((await get(one)).data));
  fs.writeFileSync(a2, Buffer.from((await get(two)).data));

  const bg = await loadImage(template);
  const av1 = await loadImage(a1);
  const av2 = await loadImage(a2);

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bg, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.arc(265, 135, 65, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(av1, 200, 70, 130, 130);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(415, 215, 65, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(av2, 350, 150, 130, 130);
  ctx.restore();

  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  fs.unlinkSync(a1);
  fs.unlinkSync(a2);

  return out;
}
