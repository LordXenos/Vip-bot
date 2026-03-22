module.exports = {
  config: {
    name: "profile",
    aliases: ["pfp", "pp"],
    version: "3.0",
    author: "Rasin",
    countDown: 5,
    role: 0,
    prefix: false,
    description: "Send profile image",
    category: "image"
  },

  onStart: async function ({ event, message, args, api, usersData }) {
    try {
      let uid;

      const findUserByName = async (query) => {
        try {
          const cleanQuery = query.replace(/@/g, "").trim().toLowerCase();
          const threadInfo = await api.getThreadInfo(event.threadID);
          const ids = threadInfo.participantIDs || [];
          const matches = [];

          for (const id of ids) {
            try {
              const name = (await usersData.getName(id)).toLowerCase();
              if (name.includes(cleanQuery)) {
                matches.push({ uid: id, name });
              }
            } catch {}
          }

          return matches;
        } catch {
          return [];
        }
      };

      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      }
      else if (args.join(" ").includes("facebook.com")) {
        const match = args.join(" ").match(/(\d{5,})/);
        if (!match) return message.reply("❌ Invalid Facebook URL");
        uid = match[0];
      }
      else if (args[0] && /^\d+$/.test(args[0])) {
        uid = args[0];
      }

      else if (args[0]) {
        const query = args.join(" ");
        const matches = await findUserByName(query);

        if (matches.length === 0) {
          return message.reply(`❌ User not found: ${query.replace(/@/g, "")}`);
        }

        if (matches.length > 1) {
          const matchList = matches.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
          return message.reply(`⚠️ Multiple users found:\n${matchList}`);
        }

        uid = matches[0].uid;
      }
      else {
        uid = event.senderID;
      }

      const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${uid}`;

      const stream = await global.utils.getStreamFromURL(avatarUrl);

      message.reply({
        body: "",
        attachment: stream
      });

    } catch (err) {
      message.reply("❌ Failed to load profile image.");
    }
  }
};