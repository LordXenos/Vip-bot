const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "hack",
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Fake Facebook hacking",
    },
    guide: {
      en: "{pn} - Hack yourself"
        + "\n{pn} @mention - Hack mentioned user"
        + "\n{pn} <name> - Search and hack user by name"
        + "\n{pn} <uid> - Hack user by ID"
        + "\n{pn} [reply] - Hack replied user",
    },
  },

  langs: {
    en: {
      notFound: "User '%1' not found in this conversation",
      multiple: "Multiple users found with name '%1':\n%2\n\nPlease use their UID or be more specific.",
      error: "❌ Something went wrong… try again later 🥲",
      hacking: "Hacking Facebook account of %1...",
      cracked: "🔓 Password cracked successfully!\n👤 Target: %1",
      twoFaDetected: "⚠️ Login failed!\n🔐 2FA detected on %1's account",
      bypassed: "✅ 2FA bypassed!\n🚀 Logged into %1's account",
      success: "Successfully hacked %1\n📩 Check inbox for ID & password"
    }
  },

  wrapText: async (ctx, text, maxWidth) => {
    if (ctx.measureText(text).width < maxWidth) return [text];
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
      if (ctx.measureText(line + word).width < maxWidth) {
        line += word + " ";
      } else {
        lines.push(line.trim());
        line = word + " ";
      }
    }
    if (line) lines.push(line.trim());
    return lines;
  },

  hackMessage: async function ({ api, event, name, getLang }) {
    const msg = await api.sendMessage(
      getLang("hacking", name),
      event.threadID
    );

    const id = msg.messageID;

    await new Promise(r => setTimeout(r, 2500));
    await api.editMessage(
      getLang("cracked", name),
      id
    );

    await new Promise(r => setTimeout(r, 2500));
    await api.editMessage(
      getLang("twoFaDetected", name),
      id
    );

    await new Promise(r => setTimeout(r, 2500));
    await api.editMessage(
      getLang("bypassed", name),
      id
    );
  },

  onStart: async function ({ args, api, event, usersData, getLang }) {
    try {
      const backgroundPath = path.join(__dirname, "rasin/hack.png");
      const avatarPath = path.join(__dirname, "cache/avatar.png");
      const outputPath = path.join(__dirname, "cache/result.png");

      await fs.ensureDir(path.join(__dirname, "cache"));

      let id;
      
      if (event.messageReply) {
        id = event.messageReply.senderID;
      }
      else if (Object.keys(event.mentions).length > 0) {
        id = Object.keys(event.mentions)[0];
      }
      else if (args[0] && /^\d+$/.test(args[0])) {
        id = args[0];
      }
      else if (args[0]) {
        const query = args.join(" ");
        const matches = await findUserByName(api, usersData, event.threadID, query);

        if (matches.length === 0) {
          return api.sendMessage(
            getLang("notFound", query.replace(/@/g, "")),
            event.threadID,
            event.messageID
          );
        }

        if (matches.length > 1) {
          const matchList = matches.map(m => `• ${m.name}: ${m.uid}`).join('\n');
          return api.sendMessage(
            getLang("multiple", query.replace(/@/g, ""), matchList),
            event.threadID,
            event.messageID
          );
        }

        id = matches[0].uid;
      }
      else {
        id = event.senderID;
      }

      const info = await api.getUserInfo(id);
      const name = info[id]?.name || "Unknown User";

      await this.hackMessage({ api, event, name, getLang });

      const avatarUrl = `https://arshi-facebook-pp.vercel.app/api/pp?uid=${id}`;
      const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(avatarPath, avatarResponse.data);

      const bg = await loadImage(backgroundPath);
      const avatar = await loadImage(avatarPath);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatar, 83, 437, 100, 100);

      ctx.font = "bold 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "left";

      const lines = await this.wrapText(ctx, name, 500);
      lines.forEach((line, i) => {
        ctx.fillText(line, 200, 495 + i * 26);
      });

      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(outputPath, buffer);

      return api.sendMessage(
        {
          body: getLang("success", name),
          attachment: fs.createReadStream(outputPath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(outputPath);
          fs.unlinkSync(avatarPath);
        },
        event.messageID
      );
    } catch (e) {
      console.error(e);
      api.sendMessage(
        getLang("error"),
        event.threadID,
        event.messageID
      );
    }
  },
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