const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "addfriend",
    aliases: ["addme", "sendfr", "friendrequest"],
    version: "1.1",
    prefix: true,
    role: 0,
    author: "Rasin",
    description: "Send friend request to a user",
    category: "utility",
    countDown: 5,
    guide: {
      en: "{pn} [uid/reply/mention/name] - Send friend request"
        + "\n{pn} @mention - Send friend request to mentioned user"
        + "\n{pn} <name> - Search user by name and send friend request"
        + "\n{pn} <uid> - Send friend request using user ID"
    }
  },

  langs: {
    en: {
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      success: "✅ 𝐅riend 𝐑equeꜱt 𝐒ent!\n\n"
        + "╭─────────────⭓\n"
        + "├‣ 𝐍ame: %1\n"
        + "├‣ 𝐔ID: %2\n"
        + "├‣ 𝐒tatuꜱ: %3\n"
        + "╰─────────────⭓\n\n"
        + "Friend request has been sent successfully! 🎉",
      alreadyFriends: "You are already friends with %1!",
      alreadySent: "You have already sent a friend request to %1.",
      incoming: "%1 has already sent you a friend request!\nPlease check your friend requests.",
      status: "Friend request status: %1",
      errorGeneric: "❌ Failed to send friend request.",
      errorInvalidID: "❌ Please provide a valid user ID!",
      errorPrivacy: "❌ Unable to process the request. The user might have privacy settings that prevent friend requests.",
      errorCustom: "❌ Error: %1"
    }
  },

  onStart: async function ({ event, message, args, api, getLang, usersData }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let targetID;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        targetID = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) {
          targetID = match[1];
        } else {
          const usernameMatch = args[0].match(/facebook\.com\/([^/?]+)/);
          if (!usernameMatch) {
            const query = args.join(" ");
            const matches = await findUserByName(api, usersData, event.threadID, query);

            if (matches.length === 0) {
              return message.reply(getLang("notFound", query.replace(/@/g, "")));
            }

            if (matches.length > 1) {
              const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
              return message.reply(getLang("multiple", query.replace(/@/g, ""), matchList));
            }

            targetID = matches[0].uid;
          }
        }
      }
    }

    if (!targetID) {
      targetID = event.type === "message_reply"
        ? event.messageReply.senderID
        : uid2 || uid1;
    }

    try {
      const result = await new Promise((resolve, reject) => {
        api.sendFriendRequest(targetID, (err, data) => {
          if (err) return reject(err);
          resolve(data);
        });
      });

      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      const avatarPath = path.join(__dirname, "cache", `avatar_${targetID}.png`);
      
      try {
        const avatarResponse = await axios.get(
          `https://arshi-facebook-pp.vercel.app/api/pp?uid=${targetID}`,
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data, "utf-8"));
      } catch (imgErr) {
        console.error("Error:", imgErr);
      }

      let replyx;
      
      if (result.success) {
        replyx = getLang("success", userName, targetID, result.friendshipStatus);
      } else if (result.friendshipStatus === "ARE_FRIENDS") {
        replyx = getLang("alreadyFriends", userName);
      } else if (result.friendshipStatus === "OUTGOING_REQUEST") {
        replyx = getLang("alreadySent", userName);
      } else if (result.friendshipStatus === "INCOMING_REQUEST") {
        replyx = getLang("incoming", userName);
      } else {
        replyx = getLang("status", result.friendshipStatus);
      }

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
      console.error("Error sending friend request:", err);
      
      let errorMsg = getLang("errorGeneric");
      
      if (err.error) {
        if (err.error.includes("User ID is required")) {
          errorMsg = getLang("errorInvalidID");
        } else if (err.error.includes("Invalid response")) {
          errorMsg = getLang("errorPrivacy");
        } else {
          errorMsg = getLang("errorCustom", err.error);
        }
      }

      return message.reply(errorMsg);
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