const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "unfriend",
    aliases: ["removefriend", "rf", "unfr"],
    version: "1.0",
    prefix: true,
    role: 2,
    author: "Rasin",
    description: "Unfriend a user on Facebook",
    category: "utility",
    countDown: 5,
    guide: {
      en: "{pn} [uid/reply/mention] - Unfriend a user\n"
        + "Examples:\n"
        + "{pn} @mention - Unfriend mentioned user\n"
        + "{pn} [reply] - Unfriend replied user\n"
        + "{pn} [uid] - Unfriend specific user ID"
    }
  },

  onStart: async function ({ event, message, args, api }) {
    const { senderID, mentions, messageReply } = event;
    let targetID;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    else if (messageReply) {
      targetID = messageReply.senderID;
    }
    else if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        targetID = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) {
          targetID = match[1];
        } else {
          return message.reply("❌ Please provide a valid user ID or profile URL!");
        }
      }
    }
    // No target specified
    else {
      return message.reply(
        "❌ Please specify who to unfriend!\n\n" +
        "Usage:\n" +
        "• unfriend @mention\n" +
        "• unfriend [reply to message]\n" +
        "• unfriend [user ID]"
      );
    }

    // Prevent unfriending yourself
    if (targetID === senderID) {
      return message.reply("❌ You cannot unfriend yourself! 😅");
    }

    try {
      // Get user info first
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      if (!userInfo[targetID]?.isFriend) {
        return message.reply(`ℹ️ You are not friends with ${userName}!`);
      }

      const avatarPath = path.join(__dirname, "cache", `unfriend_${targetID}.png`);
      
      try {
        const avatarResponse = await axios.get(
          `https://arshi-facebook-pp.vercel.app/api/pp?uid=${targetID}`,
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data, "utf-8"));
      } catch (imgErr) {
        console.error("Error fetching avatar:", imgErr);
      }

      await new Promise((resolve, reject) => {
        api.unfriend(targetID, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const replyx = `💔 𝐔nfriended 𝐒ucceꜱꜱfully!\n\n` +
                         `╭─────────────⭓\n` +
                         `├‣ 𝐍ame: ${userName}\n` +
                         `├‣ 𝐔ID: ${targetID}\n` +
                         `╰─────────────⭓\n\n` +
                         `You are no longer friends with ${userName}`;

      const messageData = {
        body: replyx
      };

      if (fs.existsSync(avatarPath)) {
        messageData.attachment = fs.createReadStream(avatarPath);
      }

      return message.reply(
        messageData,
        () => {
          if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
          }
        }
      );

    } catch (err) {
      console.error("Error unfriending user:", err);
      
      let errorMsg = "❌ Failed to unfriend user.";
      
      if (err.error) {
        errorMsg = `❌ Error: ${err.error}`;
      } else if (err.toString().includes("404")) {
        errorMsg = "❌ The unfriend API endpoint is currently unavailable. Facebook may have changed this feature.";
      }

      return message.reply(errorMsg);
    }
  }
};