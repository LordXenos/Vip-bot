const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "kiss2",
    version: "2.0.0",
    author: "Rasin",
    countDown: 5,
    role: 0,
    longDescription: "Kiss with a random person 😘",
    category: "fun",
    guide: "{p}kiss2",
    prefix: true
  },

  onStart: async function ({ api, message, event }) {
    const owner = module.exports.config;
    const eAuth = "UmFzaW4=";
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");
    if (owner.author !== dAuth)
      return message.reply("Author mismatch 👀");

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
      return message.reply("User not found! bla blaaa");

    const targetID = candidates[Math.floor(Math.random() * candidates.length)];

    const avatar1 = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${senderID}`;
    const avatar2 = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${targetID}`;

    const canvas = createCanvas(950, 850);
    const ctx = canvas.getContext("2d");

    const background = await loadImage("https://files.catbox.moe/6qg782.jpg");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const av1 = await loadImage(avatar1);
    const av2 = await loadImage(avatar2);

    ctx.save();
    ctx.beginPath();
    ctx.arc(535, 260, 85, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(av1, 445, 175, 170, 170);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(175, 370, 85, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(av2, 90, 280, 170, 170);
    ctx.restore();

    const path = `${__dirname}/tmp/kiss2.png`;
    fs.writeFileSync(path, canvas.toBuffer("image/png"));

    message.reply(
  {
    body: "🧸🎀 𝐑𝐚𝐧𝐝𝐨𝐦 𝐤𝐢𝐬𝐬 𝐝𝐞𝐥𝐢𝐯𝐞𝐫𝐞𝐝 😘",
    attachment: fs.createReadStream(path)
  },
  () => fs.unlinkSync(path)
);

  }
};

