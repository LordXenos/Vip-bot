const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair6",
    aliases: ["pr6"],
    author: "@ariyan",
    category: "TOOLS",
    version: "1.0.0",
    countDown: 5
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData?.name || "User";

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo || [];

      const me = users.find(u => u.id == event.senderID);

      if (!me || !me.gender)
        return api.sendMessage(
          "⚠️ Could not determine your gender.",
          event.threadID,
          event.messageID
        );

      let matchList = [];

      if (me.gender === "MALE") {
        matchList = users.filter(
          u => u.gender === "FEMALE" && u.id != event.senderID
        );
      } else if (me.gender === "FEMALE") {
        matchList = users.filter(
          u => u.gender === "MALE" && u.id != event.senderID
        );
      } else {
        return api.sendMessage(
          "⚠️ Your gender is undefined. Cannot find a match!",
          event.threadID,
          event.messageID
        );
      }

      if (!matchList.length)
        return api.sendMessage(
          "🌚 No suitable match found in the group.",
          event.threadID,
          event.messageID
        );

      const match = matchList[Math.floor(Math.random() * matchList.length)];
      const matchName = match.name;

      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext("2d");

      const bg = await loadImage(
        "https://i.postimg.cc/tRFY2HBm/0602f6fd6933805cf417774fdfab157e.jpg"
      );

      const img1 = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720`
      );

      const img2 = await loadImage(
        `https://graph.facebook.com/${match.id}/picture?width=720&height=720`
      );

      ctx.drawImage(bg, 0, 0, 800, 400);
      ctx.drawImage(img1, 385, 40, 170, 170);
      ctx.drawImage(img2, 587, 190, 180, 170);

      const filePath = path.join(__dirname, "pair6.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      const lovePercent = Math.floor(Math.random() * 31) + 70;

      api.sendMessage(
        {
          body: `𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹 𝗽𝗮𝗶𝗿𝗶𝗻𝗴!\n・ ${senderName} 🎀\n・ ${matchName} 🎀\n💌🫶🏻𝗪𝗶𝘀𝗵 𝘆𝗼𝘂 𝘁𝘄𝗼 𝗵𝘂𝗻𝗱𝗿𝗲𝗱 𝘆𝗲𝗮𝗿𝘀 𝗼𝗳 𝗵𝗮𝗽𝗽𝗶𝗻𝗲𝘀𝘀 💝💝\n\n𝗟𝗼𝘃𝗲 𝗽𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${lovePercent}% 💙✨`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (err) {
      api.sendMessage(
        "❌  An unknown error occurred while trying to find a match.\n" +
        err.message,
        event.threadID,
        event.messageID
      );
    }
  }
};