const axios = require("axios");
const apix = "https://nusrat-is-my-mine-onlyyyyyyyyyyyyyyyy.onrender.com/api";
const teachx = `${apix}/teach`;
const chatx = `${apix}/mira`;
const listx = `${apix}/list?count=true`;
const teacherx = `${apix}/teachers`;

const rasinx = {};

const arshi = ["mira", "bby", "mikasa", "xuna", "janu", "xanu", "bot", 'বট', 'jaan', 'jan'];

module.exports = {
  config: {
    name: "mira",
    aliases: arshi,
    version: "3.1.0",
    author: "Tasbiul Islam Rasin",
    countDown: 1,
    role: 0,
    longDescription: { en: "Chat with mikasa" },
    category: "no prefix",
    guide: { en: "mikasa <your_message>" }
  },

  onStart: async function ({ api, event, args, messageID, threadID, senderID, message }) {
    const raw = args.join(" ").trim();
    const key = `${threadID}_${senderID}`;

    if (!raw) {
      try {
        const reply0 = await axios.get(`${chatx}?message=baby`);
        const reply = reply0.data.message;
        const userInfo = await api.getUserInfo(senderID);
        const sender = userInfo[senderID].name || "User";

        return api.sendMessage({
          body: `${sender} ${reply}`,
          mentions: [{ tag: sender, id: senderID, fromIndex: 0 }]
        }, threadID, (_, info) => {
          if (info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: senderID
            });
          }
        }, messageID);
      } catch (err) {
        console.error("Empty raw error:", err.message);
        return api.sendMessage("❌ Something went wrong.", threadID, messageID);
      }
    }

    if (raw === "list") {
      try {
        const res = await axios.get(listx);
        return api.sendMessage(res.data?.message ? res.data.message : "❌", threadID, messageID);
      } catch {
        return api.sendMessage("❌ Couldn't fetch list.", threadID, messageID);
      }
    }

    if (raw.toLowerCase() === "teachers" || raw.toLowerCase() === "teachers list") {
      try {
        const res = await axios.get(teacherx);

        if (!res.data.teachers || res.data.teachers.length === 0) {
          return api.sendMessage("❌ No teachers found!", threadID, messageID);
        }

        const mergedTeachers = {};
        const idToNameMap = {};

        for (const teacher of res.data.teachers) {
          if (/^\d+$/.test(teacher.name)) {
            try {
              const userInfo = await api.getUserInfo(teacher.name);
              const userName = userInfo[teacher.name]?.name;
              if (userName) {
                idToNameMap[teacher.name] = userName;
              }
            } catch (err) {
              idToNameMap[teacher.name] = teacher.name;
            }
          }
        }

        for (const teacher of res.data.teachers) {
          let finalName = teacher.name;
          if (/^\d+$/.test(teacher.name) && idToNameMap[teacher.name]) {
            finalName = idToNameMap[teacher.name];
          }
          if (mergedTeachers[finalName]) {
            mergedTeachers[finalName] += teacher.teaches;
          } else {
            mergedTeachers[finalName] = teacher.teaches;
          }
        }

        const sortedTeachers = Object.entries(mergedTeachers)
          .map(([name, teaches]) => ({ name, teaches }))
          .sort((a, b) => b.teaches - a.teaches);

        if (sortedTeachers.length === 0) {
          return api.sendMessage("❌ No teachers found!", threadID, messageID);
        }

        let msg = `🫶🏻 𝗔𝗹𝗹 𝗧𝗲𝗮𝗰𝗵𝗲𝗿𝘀 𝗟𝗶𝘀𝘁\n\n`;
        sortedTeachers.forEach((teacher, index) => {
          const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
          msg += `${medal} ${teacher.name}\n   📚 Teaches: ${teacher.teaches}\n\n`;
        });
        msg += `\n𝗧𝗼𝘁𝗮𝗹 𝗧𝗲𝗮𝗰𝗵𝗲𝗿𝘀: ${sortedTeachers.length}`;

        return api.sendMessage(msg, threadID, messageID);
      } catch (error) {
        console.error("Teachers list error:", error.message);
        return api.sendMessage("❌ Failed to fetch teachers list.", threadID, messageID);
      }
    }

    if (raw.toLowerCase() === "top" || raw.toLowerCase() === "top teachers") {
      try {
        const res = await axios.get(`${teacherx}?top=true`);

        if (!res.data.top_teachers || res.data.top_teachers.length === 0) {
          return api.sendMessage("❌ No teachers found!", threadID, messageID);
        }

        const mergedTeachers = {};
        const idToNameMap = {};

        for (const teacher of res.data.top_teachers) {
          if (/^\d+$/.test(teacher.name)) {
            try {
              const userInfo = await api.getUserInfo(teacher.name);
              const userName = userInfo[teacher.name]?.name;
              if (userName) {
                idToNameMap[teacher.name] = userName;
              }
            } catch (err) {
              idToNameMap[teacher.name] = teacher.name;
            }
          }
        }

        for (const teacher of res.data.top_teachers) {
          let finalName = teacher.name;
          if (/^\d+$/.test(teacher.name) && idToNameMap[teacher.name]) {
            finalName = idToNameMap[teacher.name];
          }
          if (mergedTeachers[finalName]) {
            mergedTeachers[finalName] += teacher.teaches;
          } else {
            mergedTeachers[finalName] = teacher.teaches;
          }
        }

        const sortedTeachers = Object.entries(mergedTeachers)
          .map(([name, teaches]) => ({ name, teaches }))
          .sort((a, b) => b.teaches - a.teaches);

        if (sortedTeachers.length === 0) {
          return api.sendMessage("❌ No teachers found!", threadID, messageID);
        }

        const top10 = sortedTeachers.slice(0, 10);
        let msg = `🏆 𝗧𝗼𝗽 𝟭𝟬 𝗧𝗲𝗮𝗰𝗵𝗲𝗿𝘀\n\n`;
        top10.forEach((teacher, index) => {
          let icon;
          if (index === 0) icon = "🥇";
          else if (index === 1) icon = "🥈";
          else if (index === 2) icon = "🥉";
          else icon = `${index + 1}.`;
          msg += `${icon} ${teacher.name}\n   📚 ${teacher.teaches} teaches\n\n`;
        });

        return api.sendMessage(msg, threadID, messageID);
      } catch (error) {
        console.error("Top teachers error:", error.message);
        return api.sendMessage("❌ Failed to fetch top teachers.", threadID, messageID);
      }
    }

    if (raw === "teach") {
      return api.sendMessage(
        "✏ 𝐓𝐞𝐚𝐜𝐡:\n\narshi teach hi => hey, how are u, hello\n\n𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐛𝐲 𝐑𝐚𝐬𝐢𝐧",
        threadID,
        messageID
      );
    }

    if (raw.startsWith("teach ")) {
      const parts = raw.substring(6).split("=>");
      const phrase = parts[0] ? parts[0].trim() : "";
      const replyText = parts[1] ? parts[1].trim() : "";

      if (!phrase || !replyText) {
        return api.sendMessage("Usage: arshi teach <text> => <reply1, reply2...>", threadID, messageID);
      }

      const replies = replyText.split(",").map(r => r.trim());

      let senderName = "Unknown";
      try {
        const userInfo = await api.getUserInfo(senderID);
        senderName = userInfo[senderID]?.name || "Unknown";
      } catch (err) {
        console.error("Failed to get user info:", err.message);
      }

      try {
        const teachReq = `${teachx}?ask=${encodeURIComponent(phrase)}&reply=${encodeURIComponent(replies.join(","))}&sender=${encodeURIComponent(senderName)}`;
        const res = await axios.get(teachReq);

        if (res.data.status === "error") {
          return api.sendMessage(res.data.message || "❌ Failed to teach.", threadID, messageID);
        }

        const askDisplay = Array.isArray(res.data.ask) ? res.data.ask.join(", ") : res.data.ask;
        const replyDisplay = Array.isArray(res.data.reply) ? res.data.reply.join(", ") : res.data.reply;

        return api.sendMessage(
          `✅ 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚃𝚎𝚊𝚌𝚑\n\nNew Teach 【 ${askDisplay} 】\nNew 𝖱eply 【 ${replyDisplay} 】\n\nTeacher: ${senderName}`,
          threadID,
          messageID
        );
      } catch (error) {
        if (error.response?.status === 403) {
          const data = error.response.data;
          return api.sendMessage(
            `${data.message || "🚫 18+ content is not allowed!"}\n\n${data.admin_message || ""}`,
            threadID,
            messageID
          );
        }
        console.error("Teach error:", error.message, error.response?.status, JSON.stringify(error.response?.data));
        return api.sendMessage(`❌ Failed to teach.\n\n${error.message}`, threadID, messageID);
      }
    }

    try {
      let url = `${chatx}?message=${encodeURIComponent(raw)}`;
      if (rasinx[key]) {
        url += `&prev=${encodeURIComponent(rasinx[key])}`;
      }

      const res = await axios.get(url);
      const reply = res.data.message || "Hi kaman asan ?";
      rasinx[key] = reply;

      return api.sendMessage(reply, threadID, (_, info) => {
        if (info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: senderID
          });
        }
      }, messageID);
    } catch (err) {
      console.error("arshi Start Error:", err.message);
      return api.sendMessage("❌ Something went wrong.", threadID, messageID);
    }
  },

  onChat: async function ({ api, event, message }) {
    const { body, threadID, senderID, messageID } = event;
    if (!body) return;

    const botID = api.getCurrentUserID();
    if (senderID === botID) return;

    const lower = body.toLowerCase().trim();
    const triggered = arshi.some(word => lower.startsWith(word));
    if (!triggered) return;

    const raw = lower.replace(new RegExp(`^(${arshi.join("|")})\\s*`, "i"), "").trim();
    if (!raw) {
      try {
        const reply0 = await axios.get(`${chatx}?message=bby`);
        const reply = reply0.data.message;

        return api.sendMessage({
          body: `${reply}`,
        }, threadID, (_, info) => {
          if (info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: senderID
            });
          }
        }, messageID);
      } catch (err) {
        console.error("onChat empty raw error:", err.message);
      }
      return;
    }

    return module.exports.onStart({ api, event, args: [raw], messageID, threadID, senderID });
  },

  onReply: async function ({ api, event, message }) {
    const { threadID, senderID, messageID, body } = event;
    const msg = body?.trim();
    if (!msg) return;

    const botID = api.getCurrentUserID();
    if (senderID === botID) return;

    const key = `${threadID}_${senderID}`;
    try {
      let url = `${chatx}?message=${encodeURIComponent(msg)}`;
      if (rasinx[key]) {
        url += `&prev=${encodeURIComponent(rasinx[key])}`;
      }

      const res = await axios.get(url);
      const reply = res.data.message || "Hi kamon asen?";
      rasinx[key] = reply;

      return api.sendMessage(reply, threadID, (_, info) => {
        if (info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: senderID
          });
        }
      }, messageID);
    } catch (err) {
      console.error("Error in Reply:", err.message);
      return api.sendMessage("❌ Error while replying.", threadID, messageID);
    }
  }
};
          
