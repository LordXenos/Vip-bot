const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "married4",
    aliases: ['marry4'],
    version: "5.0.0",
    author: "Rasin",
    countDown: 5,
    prefix: false,
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

    await message.reply("💍 Finding your destiny...");

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
    } catch (err) {
      console.error(err);
      message.reply("Something went wrong while marrying 😵‍💫");
    }
  }
};

async function makeImage({ one, two }) {
  const root = path.resolve(__dirname, "cache", "canvas");
  const templatePath = path.resolve(root, "marriedv5.png");
  const outputPath = path.resolve(root, `married5_${one}_${two}.png`);
  const avatarOnePath = path.resolve(root, `avt_${one}.png`);
  const avatarTwoPath = path.resolve(root, `avt_${two}.png`);

  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });

  try {
    const getAvatar = id =>
      axios.get(
        `https://arshi-facebook-pp.vercel.app/api/pp?uid=${id}`,
        { responseType: "arraybuffer" }
      );

    fs.writeFileSync(avatarOnePath, Buffer.from((await getAvatar(one)).data));
    fs.writeFileSync(avatarTwoPath, Buffer.from((await getAvatar(two)).data));

    const background = await loadImage(templatePath);
    const avatarOne = await loadImage(avatarOnePath);
    const avatarTwo = await loadImage(avatarTwoPath);

    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.arc(260 + 60, 110 + 60, 60, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarOne, 260, 110, 120, 120);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(120 + 60, 130 + 60, 60, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarTwo, 120, 130, 120, 120);
    ctx.restore();

    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

    fs.unlinkSync(avatarOnePath);
    fs.unlinkSync(avatarTwoPath);

    return outputPath;
  } catch (err) {
    [avatarOnePath, avatarTwoPath, outputPath].forEach(f => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
    throw err;
  }
}
